import * as THREE from 'three';

// NOT SOURCED composition margins, not machine dimensions. The loader's
// actual rig-local feed bounds are the only geometry input to this camera.
const SIDE_MARGIN = 0.04;
const VERTICAL_MARGIN = 0.06;

/** Minimum eye-to-target distance for a complete turn around a vertical
 * cylinder. These support-function inequalities cover every azimuth, not
 * just sampled camera angles. They also keep the near plane in front of the
 * envelope. The cylinder encloses the transformed, scenery-free GLB bounds;
 * it does not claim to cover arbitrary boom/rotary animation or site props. */
function requiredDistance(radius, yMin, yMax, cosine, sine, tanH, tanV, near) {
  const alongY = coefficient => Math.max(coefficient * yMin, coefficient * yMax);
  return Math.max(
    radius * Math.sqrt(1 / (tanH * tanH) + cosine * cosine) + alongY(sine),
    (radius * Math.abs(-sine + tanV * cosine) + alongY(cosine + tanV * sine)) / tanV,
    (radius * Math.abs(sine + tanV * cosine) + alongY(-cosine + tanV * sine)) / tanV,
    near + radius * cosine + alongY(sine),
  );
}

export function fitOrbitCamera({ framing, matrixWorld, width, height, fov,
  radius, eyeY, look, near = 0.25, far = 2500, clearanceFov = fov }) {
  if (framing?.space !== 'rig-local' || !matrixWorld?.isMatrix4 ||
      !matrixWorld.elements.every(Number.isFinite) ||
      ![width, height, fov, clearanceFov, radius, eyeY, near, far].every(Number.isFinite) ||
      width <= 0 || height <= 0 || fov <= 0 || fov >= 180 || radius <= 0 || near <= 0 || far <= near ||
      clearanceFov <= 0 || clearanceFov >= 180 ||
      !Array.isArray(look) || look.length !== 3 || !look.every(Number.isFinite)) return null;
  const { min, max } = framing;
  if (![min, max].every(v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)) ||
      min.some((v, i) => v > max[i]) || min.every((v, i) => v === max[i])) return null;

  const bounds = new THREE.Box3();
  const corners = [];
  for (let i = 0; i < 8; i++) {
    const point = new THREE.Vector3(i & 1 ? max[0] : min[0],
      i & 2 ? max[1] : min[1], i & 4 ? max[2] : min[2]).applyMatrix4(matrixWorld);
    corners.push(point);
    bounds.expandByPoint(point);
  }
  const tanVFull = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  const tanHFull = tanVFull * width / height;
  const tanH = tanHFull * (1 - SIDE_MARGIN * 2);
  const tanV = tanVFull * (1 - VERTICAL_MARGIN * 2);
  const baseDistance = Math.hypot(radius, eyeY - look[1]);
  const cosine = radius / baseDistance, sine = (eyeY - look[1]) / baseDistance;
  const radialExtent = center => Math.max(...corners.map(p => Math.hypot(p.x - center.x, p.z - center.z)));
  const authoredLook = new THREE.Vector3(...look);
  const authoredExtent = radialExtent(authoredLook);
  const authoredRequired = requiredDistance(authoredExtent, bounds.min.y - look[1],
    bounds.max.y - look[1], cosine, sine, tanH, tanV, near);

  // Keep existing small-machine composition whenever its entire turn already
  // fits. Large rigs use their measured center, retaining the authored pitch,
  // orbit speed and minimum viewing distance. Hero and mast modes are separate.
  const authored = authoredRequired <= baseDistance;
  const center = authored ? authoredLook : bounds.getCenter(new THREE.Vector3());
  const extent = authored ? authoredExtent : radialExtent(center);
  const yMin = bounds.min.y - center.y, yMax = bounds.max.y - center.y;
  const distance = authored ? baseDistance : Math.max(baseDistance,
    requiredDistance(extent, yMin, yMax, cosine, sine, tanH, tanV, near));
  const deepest = distance + cosine * extent - Math.min(sine * yMin, sine * yMax);
  if (!Number.isFinite(distance) || deepest >= far) return null;
  // The full near-plane rectangle lies within this sphere about the eye.
  // Keeping that sphere outside the cylinder prevents rig/near-plane contact
  // even while the position and look springs are transitioning independently.
  const clearanceTanV = Math.tan(THREE.MathUtils.degToRad(Math.max(fov, clearanceFov)) / 2);
  const clearanceTanH = clearanceTanV * width / height;
  const clearanceRadius = extent + near * Math.sqrt(1 + clearanceTanH * clearanceTanH + clearanceTanV * clearanceTanV);
  return { authored, radius: distance * cosine, eyeY: center.y + distance * sine,
    look: center.toArray(), clearanceRadius, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() } };
}

/** Clamp only the eye's horizontal distance; camera modes that intentionally
 * inspect the mast never call this guard. No mesh traversal or raycast per
 * frame, and no guessed machine dimensions. */
export function keepOrbitOutsideRig(position, fit, angle = 0) {
  if (!fit) return false;
  const dx = position.x - fit.look[0], dz = position.z - fit.look[2];
  const distance = Math.hypot(dx, dz);
  if (distance >= fit.clearanceRadius) return false;
  const x = distance > 1e-9 ? dx / distance : Math.sin(angle);
  const z = distance > 1e-9 ? dz / distance : Math.cos(angle);
  position.x = fit.look[0] + x * fit.clearanceRadius;
  position.z = fit.look[2] + z * fit.clearanceRadius;
  return true;
}

/** Source identity, root placement, feed bounds and viewport invalidate the
 * fit. Ordinary orbit motion does not rescan geometry or recompute framing. */
export function createOrbitFramer() {
  let cachedRoot = null, cachedKey = '', fit = null;
  return {
    fit(rig, view) {
      const spec = rig?.getSpec?.();
      const framing = spec?.glb?.feedFraming || spec?.glb?.framing;
      const root = framing && rig?.group?.children.find(child => child.visible && child.userData.spec === spec);
      if (!root || !Array.isArray(framing.min) || !Array.isArray(framing.max)) {
        cachedRoot = null;
        fit = null;
        return null;
      }
      root.updateWorldMatrix(true, false);
      const key = [view.width, view.height, view.fov, view.radius, view.eyeY,
        view.near, view.far, view.clearanceFov, ...view.look, spec.id, framing.space, framing.scope,
        ...root.matrixWorld.elements, ...framing.min, ...framing.max].join(',');
      if (cachedRoot !== root || cachedKey !== key) {
        cachedRoot = root;
        cachedKey = key;
        fit = fitOrbitCamera({ framing, matrixWorld: root.matrixWorld, ...view });
      }
      return fit;
    },
  };
}
