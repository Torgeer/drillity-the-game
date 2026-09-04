import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const compactHeadURL = new URL('./models/compact-rotary-head.glb', import.meta.url).href;
const compactMastURL = new URL('./models/compact-feed-mast.glb', import.meta.url).href;

/** Blender-authored module. One fetch per rig system; no network at frame time. */
export async function loadReferenceModels(ctx) {
  await Promise.all([
    loadModel(ctx, 'compactRotary', compactHeadURL, ['spindle', 'tool-out']),
    loadModel(ctx, 'compactMast', compactMastURL, ['mast-lower', 'mast-upper']),
  ]);
}

async function loadModel(ctx, key, url, anchors) {
  if (ctx.rigModels?.[key]) return;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`GLB HTTP ${response.status}`);
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
    if (anchors.some(name => !gltf.scene.getObjectByName(name))) {
      throw new Error(`${key} GLB is missing its animation anchors`);
    }
    ctx.rigModels = { ...ctx.rigModels, [key]: gltf.scene };
  } catch (error) {
    console.warn(`[rig] Blender ${key} unavailable; using procedural geometry.`, error);
  }
}

export function cloneCompactMast(template, stack) {
  for (const half of ['lower', 'upper']) {
    const model = template.getObjectByName(`mast-${half}`).clone(true);
    model.name = `blender-mast-${half}`;
    // The runtime flex stack already supplies the upper half's 2.1m offset.
    model.position.set(0, 0, 0);
    model.traverse(node => {
      if (node.isMesh) {
        node.geometry = node.geometry.clone();
        node.castShadow = node.receiveShadow = true;
      }
    });
    stack[half].add(model);
  }
}

/** Static merging disposes its inputs, so instances must own their geometry. */
export function cloneCompactHead(template, parent, position, scale) {
  const model = template.clone(true);
  model.name = 'blender-compact-rotary';
  model.userData.dynamic = true;
  model.position.set(...position);
  model.scale.setScalar(scale);
  model.traverse((node) => {
    if (node.isMesh) {
      node.geometry = node.geometry.clone();
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  const spindle = model.getObjectByName('spindle');
  spindle.userData.dynamic = true;
  parent.add(model);
  return { group: model, spindle, out: model.getObjectByName('tool-out') };
}

export function disposeReferenceModels(ctx) {
  const materials = new Set();
  for (const key of ['compactRotary', 'compactMast']) {
  const template = ctx.rigModels?.[key];
  if (!template) continue;
  template.traverse((node) => {
    if (!node.isMesh) return;
    node.geometry.dispose();
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
  });
  delete ctx.rigModels[key];
  }
  for (const material of materials) material.dispose();
}
