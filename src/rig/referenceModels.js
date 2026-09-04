import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const compactHeadURL = new URL('./models/compact-rotary-head.glb', import.meta.url).href;

/** Blender-authored module. One fetch per rig system; no network at frame time. */
export async function loadReferenceModels(ctx) {
  if (ctx.rigModels?.compactRotary) return;
  try {
    const response = await fetch(compactHeadURL, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`GLB HTTP ${response.status}`);
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
    if (!gltf.scene.getObjectByName('spindle') || !gltf.scene.getObjectByName('tool-out')) {
      throw new Error('Compact rotary GLB is missing its animation anchors');
    }
    ctx.rigModels = { ...ctx.rigModels, compactRotary: gltf.scene };
  } catch (error) {
    console.warn('[rig] Blender rotary module unavailable; using procedural rotary head.', error);
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
  const template = ctx.rigModels?.compactRotary;
  if (!template) return;
  const materials = new Set();
  template.traverse((node) => {
    if (!node.isMesh) return;
    node.geometry.dispose();
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
  });
  for (const material of materials) material.dispose();
  delete ctx.rigModels.compactRotary;
}
