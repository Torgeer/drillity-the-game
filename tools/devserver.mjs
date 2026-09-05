/**
 * ensureServer — the browser gates provide their own subject.
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * `npm run check:reach` and `.hudqa/measure.mjs` measure the running game, so
 * until now both began "needs `npm run dev` on 5178" and exited 2 when it was
 * not there. A gate with a manual prerequisite is a gate that gets skipped,
 * and a skipped gate is the empty-set problem one level up: it passes for ever
 * by never running. Neither could be wired into `npm run check`, which is the
 * only place a gate actually stops a regression.
 *
 * So: if the port already answers, use it — that is the ordinary developer
 * case and it costs nothing. If it does not, start vite on that port, hand
 * back a `stop()`, and shut it down afterwards. Nothing is skipped either way.
 *
 * `--strictPort` is deliberate. Without it vite hunts for a free port and
 * returns a server on a DIFFERENT one, so the probe would connect to whatever
 * was on the port it asked for — which on this machine, with a dozen agents
 * running, is somebody else's tree. A gate measuring the wrong repository is
 * worse than one that did not run.
 *
 * node, not the `.bin` shim: `vite.cmd` needs a shell on Windows, and a shell
 * in the middle makes the child unkillable by pid.
 */
import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const require = createRequire(import.meta.url);

/**
 * Where is vite's CLI entry?
 *
 * NOT `require.resolve('vite/bin/vite.js')`, which is what this file did first
 * and which throws ERR_PACKAGE_PATH_NOT_EXPORTED on every install of vite 5:
 * the package declares an `exports` map — `.`, `./client`, `./runtime`,
 * `./dist/client/*`, `./types/*`, `./package.json` — and `./bin/vite.js` is
 * not in it, so Node refuses the subpath although the file is sitting right
 * there. The gate therefore reported "vite is not installed here (run
 * `npm install`)" against a tree with vite 5.4.21 fully installed. That is a
 * confident false negative aimed at the operator — the exact shape this
 * file's own header warns about — and it meant `check:reach` could never
 * start its own server, so it could never be wired into `npm run check` and
 * the one thing this module exists to make possible did not work.
 *
 * `vite/package.json` IS exported, so ask the package where its own bin is
 * and resolve that against the package directory. The path is then vite's
 * declaration rather than our guess, and it survives vite moving the file.
 *
 * @returns {{bin: string} | {err: string}}
 */
function findViteBin() {
  let pkgPath;
  try {
    pkgPath = require.resolve('vite/package.json');
  } catch (e) {
    return { err: 'vite is not installed here (run `npm install`)' };
  }
  const pkg = require(pkgPath);
  const rel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.vite;
  if (!rel) return { err: `vite ${pkg.version} declares no \`vite\` bin in ${pkgPath}` };
  const bin = resolvePath(dirname(pkgPath), rel);
  /* Measure, do not assume. A declared path that is not on disk is a THIRD
     distinct failure and must not be reported as either of the other two —
     saying "not installed" about a broken install is how the first version of
     this cost a round. */
  if (!existsSync(bin)) return { err: `vite ${pkg.version} declares bin "${rel}", but ${bin} does not exist` };
  return { bin };
}

/* This repository's root — the directory devserver.mjs's parent lives in.
   Forward slashes and no trailing one: that is the shape vite's `/@fs/` wants,
   on Windows too. `split`/`join` rather than a regex, because the separator
   being escaped is the escape character. */
const ROOT = fileURLToPath(new URL('..', import.meta.url))
  .split('\\').join('/')
  .replace(/\/+$/, '');

/**
 * Is the server on `origin` serving THIS tree?
 *
 * Vite serves any file under its own root, and `/@fs/<absolute path>` is how
 * it addresses one. So ask it for OUR package.json by absolute path and
 * compare what comes back with the file on disk. A server rooted somewhere
 * else answers that path with its own SPA index.html — status 200, wrong
 * body — which is why this compares CONTENT and not the status code.
 *
 * @returns {Promise<{ok: true} | {ok: false, why: string}>}
 */
async function servesThisTree(origin) {
  let want;
  try {
    want = JSON.parse(readFileSync(resolvePath(ROOT, 'package.json'), 'utf8'));
  } catch (e) {
    return { ok: false, why: `cannot read this tree's own package.json: ${e.message}` };
  }
  let text;
  try {
    const r = await httpGet(`${origin}/@fs/${ROOT}/package.json`, 8000);
    if (r.status < 200 || r.status >= 300) {
      return { ok: false, why: `it answered ${r.status} for this tree's package.json` };
    }
    text = r.body;
  } catch (e) {
    return { ok: false, why: `could not fetch this tree's package.json from it: ${e.message}` };
  }
  let got;
  try {
    // Served raw; the brace slice covers a vite that wraps it in a module
    // instead. Either way the object is the thing being compared.
    const i = text.indexOf('{');
    const j = text.lastIndexOf('}');
    got = JSON.parse(i >= 0 && j > i ? text.slice(i, j + 1) : text);
  } catch (e) {
    return { ok: false, why: 'it served something that is not a package.json at all' };
  }
  if (got.name !== want.name || got.version !== want.version) {
    return { ok: false, why: `it is serving ${got.name || '(unnamed)'}@${got.version || '?'}, `
      + `not ${want.name}@${want.version}` };
  }
  return { ok: true };
}

/**
 * Is a server ALREADY there? Distinguishes "nothing is listening" from "busy".
 *
 * `answers()` alone is not that question. A vite that is up but pre-bundling
 * three.js does not respond inside four seconds, so a single probe reports
 * `false` against a live server — and the caller then tries to start a second
 * one on the same port and dies with "Port 5178 is already in use". Measured
 * here doing exactly that, twice in a row.
 *
 * The retries are nearly free in the case that matters: with nothing
 * listening, the connection is REFUSED immediately rather than timing out, so
 * three attempts cost microseconds. The cost is only paid when there really
 * is something there, which is when it is worth paying.
 */
async function alreadyServing(origin) {
  for (let i = 0; i < 3; i++) {
    if (await answers(origin, i === 0 ? 4000 : 8000)) return true;
    if (i < 2) await sleep(400);
  }
  return false;
}

/**
 * One HTTP GET that owns its own socket and cannot outlive itself.
 *
 * ── THE INSTRUMENT WAS BREAKING THE THING IT WAS MEASURING ─────────────────
 * Every probe in this file used to be `fetch(origin, { signal })` with an
 * AbortController timeout. Node's global fetch is undici with a shared,
 * keep-alive connection pool per origin, and an ABORTED fetch leaves that
 * pool's socket in a state later requests queue behind. While vite is coming
 * up this file fires a probe every 500 ms and most of them time out — so by
 * the time one succeeds, the pool for that origin is poisoned FOR THE WHOLE
 * PROCESS.
 *
 * Measured, and it is not subtle. After `ensureServer` reported "vite up on
 * 5194 after 10.1 s", four plain `fetch()` calls to that same origin from the
 * same process aborted at 5 s, 10 s, 15 s and 20 s — against a server that
 * answered instantly from a fresh process. Two visible consequences: a second
 * `ensureServer()` on a live port reported "nothing on that port", started a
 * second vite and died with "Port 5193 is already in use"; and a gate that
 * had just started its own server could not then talk to it.
 *
 * `node:http` with `agent: false` — a new socket per request, destroyed on
 * timeout, nothing shared and nothing left behind. Slower per call by a
 * negligible amount, and it cannot poison anything.
 */
function httpGet(url, ms = 4000) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(url, { agent: false, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { if (body.length < 65536) body += d; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.setTimeout(ms, () => req.destroy(new Error(`timed out after ${ms} ms`)));
    req.on('error', reject);
    req.end();
  });
}

/** Does anything answer on this port? Resolves false on any transport error. */
async function answers(origin, ms = 4000) {
  try {
    const r = await httpGet(origin, ms);
    return r.status > 0;
  } catch (e) {
    return false;
  }
}

/**
 * @param {string|number} port
 * @param {(s: string) => void} [say] progress sink, defaults to console.log
 * @returns {Promise<{origin: string, spawned: boolean, stop: () => void}>}
 */
export async function ensureServer(port, say = console.log) {
  /* 127.0.0.1, not localhost: on Windows `localhost` resolves to ::1 first and
     a server bound to IPv4 only will look dead through it. */
  const origin = `http://127.0.0.1:${port}`;

  if (await alreadyServing(origin)) {
    /* ANSWERING IS NOT THE SAME AS BEING THIS REPOSITORY.
       The spawn path below passes `--strictPort` precisely because "a gate
       measuring the wrong repository is worse than one that did not run" —
       and then this path, which is the one that actually runs on a machine
       with a dozen agents on it, handed back whatever was listening. A stale
       vite from a killed run, or another agent's tree, and every number the
       caller then prints is about somebody else's code, attributed to yours.
       There is no error and no gap: just a confident wrong answer. */
    const who = await servesThisTree(origin);
    if (who.ok) {
      say(`  dev server on ${port} is already up and is this tree — using it`);
      return { origin, spawned: false, stop() {} };
    }
    throw new Error(`Something is serving ${origin}, but it is NOT this repository `
      + `(${who.why}). Refusing to measure it: a gate pointed at the wrong tree `
      + 'produces a confident wrong answer, which is worse than one that did not '
      + `run. Stop whatever holds port ${port}, or pass a different port.`);
  }

  const found = findViteBin();
  if (found.err) {
    throw new Error(`Nothing is serving ${origin} and this gate cannot start one: ${found.err}. `
      + 'It has no subject to measure, so it is failing rather than passing: '
      + 'a check that cannot run has not passed.');
  }

  /* `--host 127.0.0.1` — BIND THE ADDRESS WE PROBE.
     vite.config.js sets `server.host: true` for phone testing, so without
     this the gate's own server binds 0.0.0.0 and Windows Firewall silently
     blocks the listener on any port it has not seen before. Measured: 5178
     and 5188 (used previously, already allowed) came up in under a second,
     while brand-new 5184, 5191 and 5192 all printed vite's "ready in 1.5 s"
     banner and then never answered 127.0.0.1 for the full 90 s wait — a
     server that is up and unreachable, reported as a server that is down.
     A QA gate has no business on the LAN anyway: `npm run dev` is the script
     that wants `--host`, and it is a different script. */
  say(`  nothing on ${port} — starting vite --strictPort on 127.0.0.1 for this run`);
  const child = spawn(process.execPath,
    [found.bin, '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
    /* fileURLToPath, not `new URL(...).pathname` with a drive-letter regex:
       pathname is percent-encoded, so the first directory with a space in it
       would hand vite a cwd of `.../my%20tree` and it would start in the
       wrong place — or not at all. */
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try { child.kill(); } catch (e) { /* already gone */ }
  };
  process.once('exit', stop);

  /* 90 s: this tree's cold start has been measured at 15.8 s for the first
     response with the machine loaded, and vite pre-bundles three.js on the way
     up. Waiting is cheap; a false "cannot reach" costs a round. */
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    if (child.exitCode !== null) {
      stop();
      throw new Error(`vite exited before it served ${origin}:\n${log.slice(-1200)}`);
    }
    if (await answers(origin, 2000)) {
      say(`  vite up on ${port} after ${((Date.now() - t0) / 1000).toFixed(1)} s`);
      return { origin, spawned: true, stop };
    }
    await sleep(500);
  }
  stop();
  throw new Error(`vite did not answer on ${origin} within 90 s:\n${log.slice(-1200)}`);
}
