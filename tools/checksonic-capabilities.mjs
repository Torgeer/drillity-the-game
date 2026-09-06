/** CPU provenance gate: actual procedural builder API, published copy and
 * Blender capability declarations. No renderer, browser or measured vibration.
 * Source: TSi 150CT PDF p2 (REV 11/2024), and manufacturer's TSi Sonic Heads
 * page for the force's explicit upper-capability qualification; see report.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { createRigSystem } from '../src/rig/rigFactory.js';
import { RIGS } from '../src/game/data.js';

const sonic = RIGS.find(r => r.id === 'sonic-truck');
assert.ok(sonic, 'sonic rig must exist');
assert.match(sonic.description, /frequency adjustable up to 150 Hz/);
assert.doesNotMatch(sonic.description, /90\s*[–-]\s*160|Terra Sonic|TSi/);
const python = readFileSync(new URL('../blender/sonic_truck.py', import.meta.url), 'utf8');
const declaration = key => {
  const match = python.match(new RegExp(`^${key}\\s*=\\s*(\\d+(?:\\.\\d+)?)\\s*(?:#|$)`, 'm'));
  assert.ok(match, `nonempty Blender declaration ${key}`);
  return Number(match[1]);
};
assert.equal(declaration('OSC_KN'), 222);
assert.equal(declaration('OSC_HZ'), 150);

const materials = new Map();
const assets = { material(kind) {
  if (!materials.has(kind)) materials.set(kind, new THREE.MeshStandardMaterial());
  return materials.get(kind);
} };
const system = createRigSystem({ THREE, assets, data: { RIGS },
  scene: new THREE.Scene(), sectionScene: new THREE.Scene(),
  qs: new URLSearchParams('glb=off'), quality: { id: 'low' },
  state: { garage: { rigId: sonic.id }, settings: {} } });
try {
  await system.init();
  for (const method of sonic.methods) {
    system.setMethod(method);
    assert.equal(system.getRigId(), sonic.id);
    const spec = system.getSpec();
    assert.equal(spec.source, 'procedural', 'this gate must exercise the corrected builder');
    assert.equal(spec.oscillatorKn, 222, `${method}: published maximum oscillator force`);
    assert.equal(spec.oscillatorHz, 150, `${method}: published maximum frequency`);
    assert.equal(spec.oscillatorKn, declaration('OSC_KN'));
    assert.equal(spec.oscillatorHz, declaration('OSC_HZ'));
  }
  console.log('PASS: sonic capability provenance; actual procedural API in sonic and auger, Blender declarations and player copy. No GPU or force/amplitude simulation claim.');
} finally {
  system.dispose();
  for (const material of materials.values()) material.dispose();
}
