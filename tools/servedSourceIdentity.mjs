import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

export const SOURCE_IDENTITY_PATH = '/__drillity_source_identity__';

/** Files on the configured server root, not files accessible through /@fs/. */
export function sourceIdentity(root) {
  const canonicalRoot = realpathSync(root);
  const walk = (relative) => readdirSync(resolve(canonicalRoot, relative), { withFileTypes: true })
    .flatMap((entry) => {
      const path = `${relative}/${entry.name}`;
      return entry.isDirectory() ? walk(path) : /\.(?:[cm]?js|css)$/.test(entry.name) ? [path] : [];
    });
  const paths = ['package.json', 'index.html', 'vite.config.js', ...walk('src').sort()];
  if (!paths.includes('src/main.js')) throw new Error('src/main.js is missing from the source inventory');
  return {
    schema: 1,
    root: canonicalRoot.replaceAll('\\', '/'),
    files: paths.map((path) => {
      const bytes = readFileSync(resolve(canonicalRoot, path));
      return { path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    }),
  };
}

/** Dev-only root identity; no browser, source transforms, or fs allow changes. */
export function servedSourceIdentityPlugin() {
  return {
    name: 'drillity:served-source-identity',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let url;
        try { url = new URL(req.url || '/', 'http://identity.invalid'); }
        catch { return next(); }
        if (url.pathname !== SOURCE_IDENTITY_PATH) return next();
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Allow', 'GET');
          res.end(JSON.stringify({ error: 'Use GET for source identity.' }));
          return;
        }
        try {
          res.end(JSON.stringify(sourceIdentity(server.config.root)));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: `Could not inventory configured root: ${error.message}` }));
        }
      });
    },
  };
}
