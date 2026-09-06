#!/usr/bin/env node
// Direct import keeps config reads inside this worktree. Vite's ordinary CLI
// config bundler walks parent directories denied by this session's sandbox.
import { createServer, build, preview } from 'vite';
import config from './vite.config.mjs';
if (process.argv.includes('--build')) {
  await build({ ...config, configFile: false });
} else if (process.argv.includes('--preview')) {
  const server = await preview({
    ...config,
    configFile: false,
    base: '/atlas-review/',
    preview: { host: '127.0.0.1', port: 5196, strictPort: true },
  });
  server.printUrls();
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.httpServer.close(() => process.exit(0)); });
} else {
  const server = await createServer({ ...config, configFile: false });
  await server.listen();
  server.printUrls();
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
}
