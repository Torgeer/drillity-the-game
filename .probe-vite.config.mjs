/* Probe-only vite config. Identical to vite.config.js except that HMR and the
   file watcher are OFF.
   Why: several agents edit this repo at once. Any save anywhere under the root
   makes the shared dev server push a full-reload, which destroys the probe's
   execution context mid-measurement ("Execution context was destroyed"). A
   measurement harness must not be at the mercy of someone else's save. */
import base from './vite.config.js';

export default {
  ...base,
  server: {
    ...(base.server || {}),
    hmr: false,
    watch: { ignored: ['**/*'] },
  },
};
