// Import the project's native ESM config directly. Vite's config bundler tries
// to walk inaccessible parent directories in restricted Windows workspaces.
import { build, createServer, preview } from 'vite';
import config from '../vite.config.js';
const mode = process.argv[2] || 'dev';
const settings = { ...config, configFile: false };
if (mode === 'build') await build(settings);
else if (mode === 'preview') {
  const server = await preview({ ...settings, preview: { host: true, port: 5179 } });
  server.printUrls();
} else if (mode === 'dev') {
  // Dependencies are native ESM; serve them directly instead of invoking the
  // same restricted esbuild directory scan during dependency discovery.
  const server = await createServer({ ...settings, optimizeDeps: { noDiscovery: true, include: [] } });
  await server.listen();
  server.printUrls();
} else throw new Error(`Unknown Vite mode: ${mode}`);
