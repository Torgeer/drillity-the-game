import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * ONE FILE FOR THE GAME, SEPARATE FILES FOR THE MACHINES.
 *
 * The shell stays a single self-contained HTML file — that is what makes this
 * project sendable as an attachment and openable on a phone. The Blender
 * machines do not go in it. A `.glb` inlined as base64 costs +33 %, and the
 * fleet is nine machines becoming eighteen; inlining them would make the build
 * unshippable, and it would also load every machine at once when the player
 * owns one. `src/core/gltfRig.js` fetches the one they own, at run time.
 *
 * Three things below make that true, and each is load-bearing:
 *
 *   1. `base: './'`. The page now references something outside itself for the
 *      first time. With the default absolute base, a build served from a
 *      sub-path (a project site, a preview URL) would look for `/models/...`
 *      at the domain root and 404. Relative, it works wherever it is put.
 *
 *   2. `assetsInlineLimit` is a FUNCTION, not the old 100000000. The number
 *      inlines everything the bundler touches, which is exactly right for the
 *      icons and fonts and exactly wrong for a mesh. The function keeps the
 *      old behaviour for every other asset and refuses it for model formats,
 *      so the day someone writes `import url from './x.glb?url'` it emits a
 *      file instead of quietly putting 33 % of a machine into the HTML.
 *
 *      Models normally never reach the bundler at all — they live in `public/`,
 *      which Vite copies to `dist/` verbatim. This is the guard for when they
 *      do, and it is here because the failure it prevents is invisible: the
 *      build still succeeds, it is just megabytes larger.
 *
 *   3. `inlineDynamicImports` stays. Every subsystem must land in the one
 *      chunk or the single file ships without it. It also folds GLTFLoader and
 *      the Meshopt decoder into that chunk, so loading a machine costs one
 *      request for the model and no request for the code that reads it.
 *
 * WHAT THIS COSTS, STATED PLAINLY: `dist/` is no longer one file. It is
 * `dist/index.html` plus `dist/models/*.glb`, and it must be SERVED
 * (`npm run preview`) rather than opened off the filesystem — `fetch()` is
 * blocked on `file://`, so a Blender machine cannot load there. The game boots
 * either way; only the Blender machines need the server, and they say so out
 * loud when they cannot be reached.
 */

/** Formats that must never be base64'd into the page, whatever their size. */
const NEVER_INLINE = /\.(glb|gltf|bin|ktx2|basis|hdr|exr|drc)$/i;

export default defineConfig({
  base: './',
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    target: 'es2020',
    // `true`  → inline it (the old blanket 100 MB limit, for everything small)
    // `false` → emit a file (meshes and any other payload asset)
    assetsInlineLimit: (filePath) => !NEVER_INLINE.test(filePath),
    chunkSizeWarningLimit: 100000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    // Everything must end up in ONE chunk so vite-plugin-singlefile can inline
    // it. Without this, each dynamically-imported system becomes its own chunk
    // and the "single file" ships without them.
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  server: { host: true, port: 5178 },
});
