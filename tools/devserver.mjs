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
import { existsSync } from 'node:fs';
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

/** Does anything answer on this port? Resolves false on any transport error. */
async function answers(origin, ms = 4000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(origin, { signal: ac.signal });
    return r.status > 0;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(t);
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

  if (await answers(origin)) {
    say(`  dev server on ${port} is already up — using it`);
    return { origin, spawned: false, stop() {} };
  }

  const found = findViteBin();
  if (found.err) {
    throw new Error(`Nothing is serving ${origin} and this gate cannot start one: ${found.err}. `
      + 'It has no subject to measure, so it is failing rather than passing: '
      + 'a check that cannot run has not passed.');
  }

  say(`  nothing on ${port} — starting vite --strictPort for this run`);
  const child = spawn(process.execPath, [found.bin, '--port', String(port), '--strictPort'], {
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
