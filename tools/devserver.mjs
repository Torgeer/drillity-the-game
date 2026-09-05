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
import { createRequire } from 'node:module';
import { setTimeout as sleep } from 'node:timers/promises';

const require = createRequire(import.meta.url);

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

  let viteBin;
  try {
    viteBin = require.resolve('vite/bin/vite.js');
  } catch (e) {
    throw new Error(`Nothing is serving ${origin} and vite is not installed here `
      + '(run `npm install`), so this gate has no subject to measure. It is failing '
      + 'rather than passing: a check that cannot run has not passed.');
  }

  say(`  nothing on ${port} — starting vite --strictPort for this run`);
  const child = spawn(process.execPath, [viteBin, '--port', String(port), '--strictPort'], {
    cwd: new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
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
