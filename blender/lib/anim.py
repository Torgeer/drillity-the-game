"""
Choreography for the machines `rig.py` builds — the authoring half of the
motion pipeline.

READ `rig.py` FIRST. This file adds nothing to its node contract; it only keys
the nodes that contract already defines. There is exactly one node convention
in this pipeline and inventing a second one would have been the whole mistake.

WHERE THE LINE IS, AND WHY IT IS THERE
--------------------------------------
The game already moves machines and none of that is replaced.

    CODE drives CONTINUOUS STATE.  `src/rig/rigFactory.js` writes `pivot:` and
    `slide:` nodes every frame from live sim state — spindle speed follows
    `state.drill.rpm`, the carriage follows feed pressure, tracks follow ground
    speed. A rotation whose speed IS a variable cannot be a baked clip, and
    `src/core/env.js` reads `getWorkLights()` every frame off the same graph.

    CLIPS drive DISCRETE CHOREOGRAPHY.  Several joints in a FIXED relationship
    over a FIXED time: a rod change, a mast raise, a tram-out, a hammer stroke,
    a kelly telescoping home. Code is bad at these — they are a script, not a
    function of state — and a glTF animation is exactly the right container.

The two meet on nodes that BOTH want (a rod change moves the same carriage the
feed drives). That overlap is not a bug to design away, it is the interesting
case, and it is settled at RUN TIME by `src/core/gltfAnim.js`, which blends
each claimed node from wherever code has just put it toward wherever the clip
wants it. Nothing here has to know. What this file must do is make the claim
LEGIBLE: `bake()` prints every node every clip touches, so the set that needs
arbitrating can be read off the build log instead of guessed at.

WHY DELTAS AND NOT ABSOLUTE VALUES
----------------------------------
Every key here is a DELTA FROM THE NODE'S REST TRANSFORM, composed at bake
time against whatever the rest transform actually is when the clip is baked.

That is not a convenience. `rig.finish()`'s join was silently RELOCATING
`mount:`/`aim:` nodes — a mount authored at x=6 came back at x=0, and the node
NAME survived, so every check that asked "did the name survive?" passed. Static
geometry mostly survives that; a clip does not. A clip keyed to an ABSOLUTE
position is keyed to one particular rest pose, and the day somebody re-sites the
carousel by 40 mm against a datasheet the clip goes on driving the old numbers
and looks plausible while being wrong. A delta is immune: it says "index sixty
degrees", not "be at sixty degrees", and it stays true.

`bake()` therefore runs AFTER the machine's own `build()` has already joined and
exported, so the rest transforms it composes against are the ones that actually
reached the file, not the ones the module authored before the join.

MEASURE, DO NOT ASSUME
----------------------
`verify()` re-opens the EXPORTED .glb, decodes the animation accessors and
checks the clip against the file: the clip is present under its own name, every
node it declared has channels, the channel target resolves to the authored node
name, and the first key of every channel matches that node's own rest TRS in the
node table. A clean build log is not evidence — `HANDOFF` §8 is a list of this
tree's log lines being correct while nothing reached the screen.

UNITS
-----
Seconds and DEGREES and METRES, and the parameter names say so. Blender axes:
Z is up, and `rig.tube()` puts a slide's travel on local Z. The exporter
converts to three.js Y-up on the way out; nothing here compensates for that,
and neither should you.
"""

import importlib.util
import json
import math
import os
import struct
import sys

import bpy
from mathutils import Quaternion, Vector

import rig as R

_BLENDER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def machine(name):
    """Import `blender/<name>.py` BY PATH, under a distinct module name.

    A motion module is called after the machine it animates, so
    `blender/motion/dth_crawler.py` and `blender/dth_crawler.py` are two files
    with one module name. Whichever directory reaches `sys.path` first wins, and
    when the loser is the machine the motion module imports ITSELF — Python
    reports it as a circular import, which is true and unhelpful. Measured while
    writing this file, and it would have been reported as a mysterious
    `AttributeError: no attribute 'CARR_Z0'` by whoever hit it next.

    So the path is stated instead of searched. The machine module is IMPORTED
    AND CALLED, never edited.
    """
    path = os.path.join(_BLENDER_DIR, name + '.py')
    if not os.path.exists(path):
        raise ImportError('no machine module at %s' % path)
    key = 'drillity_machine_' + name
    if key in sys.modules:
        return sys.modules[key]
    for p in (os.path.join(_BLENDER_DIR, 'lib'), _BLENDER_DIR):
        if p not in sys.path:
            sys.path.insert(0, p)
    spec = importlib.util.spec_from_file_location(key, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[key] = mod
    spec.loader.exec_module(mod)
    return mod


# Sampling rate the exporter bakes at. Blender's glTF exporter evaluates object
# animation FRAME BY FRAME — measured: two linear keyframes 60 frames apart came
# out of the exporter as 61 glTF keys — so this number, not the number of keys
# authored, is what sets the byte cost of a clip. It also buys the ease-in/out
# on every segment for free, which is what stops a hydraulic move reading as a
# lerp. 24 is enough for machine motion: the runtime interpolates continuously
# between samples, so this is a sampling rate, not a playback rate.
FPS = 24

# Tolerance for the rest-pose check in verify(), in metres and in quaternion
# component units. The exporter writes float32, so ~1e-6 is the floor; 1e-4 is
# loose enough not to fire on rounding and tight enough that a 40 mm relocation
# cannot hide under it.
REST_TOL = 1e-4


# ═════════════════════════════════════════════════════════════════════════════
# Authoring
# ═════════════════════════════════════════════════════════════════════════════

class Clip:
    """One named choreographed sequence.

    The name becomes the glTF animation's name verbatim and is what
    `gltfAnim.js` plays by, so it is a game-facing string: lower-case, hyphens,
    no spaces (`rod-change`, `mast-raise`, `tram-out`).
    """

    def __init__(self, name, fps=FPS):
        if not name or ' ' in name or name != name.strip():
            raise ValueError('clip name %r must be a bare token — it is the glTF '
                             'animation name and gltfAnim.js plays by it' % (name,))
        self.name = name
        self.fps = fps
        # node name -> list of (t_seconds, rot_deg_or_None, move_m_or_None, interp)
        self._keys = {}
        self._order = []          # node names, in the order first touched

    # ── the two things a clip can do ────────────────────────────────────────
    def rotate(self, node, t, deg, axis='Z', interp='BEZIER'):
        """Key `pivot:<node>` at `t` seconds, `deg` degrees from its REST
        orientation about its own local `axis`.

        Only a `pivot:` may be rotated. That is `rig.py`'s contract — "a node
        the game ROTATES" — and a clip that rotated a slide would be authoring
        motion on a node kind the runtime drives differently.
        """
        return self._key(node, t, R.NODE_PIVOT, rot=(axis, float(deg)), interp=interp)

    def spin(self, node, t0, t1, deg, axis='Z', interp='LINEAR', step=90.0):
        """Turn `pivot:<node>` through `deg` degrees between `t0` and `t1`,
        however many whole turns that is.

        USE THIS FOR ANYTHING OVER 180 DEGREES. A glTF rotation channel is a
        QUATERNION, and a quaternion cannot hold a turn count: three full turns
        and no turn at all are the same four numbers. Measured on the first
        export of the rod change — the spindle was keyed +/-1080 deg and the
        file came back with TWO keys on that channel instead of 402, because
        every sample was the identity and the exporter's optimiser correctly
        collapsed them. Nothing raised; the head simply never turned.

        So a turn has to be told as a sequence of steps under half a turn each,
        and this writes them. `interp` defaults to LINEAR because a spindle runs
        at a speed — easing every intermediate step would make it pulse.

        IT WRITES ONE KEY PER EXPORTED FRAME, and that is not extravagance.
        Keyed at 90 deg steps instead, the first export of the rod change came
        back carrying 3060 degrees of spindle against 1080 + 1080 authored — a
        MEASURED 42 % more rotation than the clip asks for. A quaternion's four
        components are sinusoids of the half-angle, so over three turns they
        oscillate; Blender's auto handles fit a curve through twelve samples of
        an oscillation and overshoot it, and the exporter then bakes the
        overshoot at every frame. Keying each exported frame leaves the
        interpolator nothing to guess at: what comes out is what was asked for.
        Keys cost nothing here anyway — the exporter samples per frame whatever
        the f-curve says.
        """
        per_frame = int(round(abs(t1 - t0) * self.fps))
        n = max(1, int(math.ceil(abs(deg) / step)), per_frame)
        prev = self._keys.get(self._full(node))
        base = prev[-1][1][1] if prev and prev[-1][1] else 0.0
        for i in range(1, n + 1):
            self.rotate(node, t0 + (t1 - t0) * i / n, base + deg * i / n,
                        axis=axis, interp=interp)
        return self

    def slide(self, node, t, m, axis='Z', interp='BEZIER'):
        """Key `slide:<node>` at `t` seconds, `m` metres from its REST position
        along its own local `axis`. Only a `slide:` may be translated."""
        return self._key(node, t, R.NODE_SLIDE, move=(axis, float(m)), interp=interp)

    def hold(self, node, t):
        """Re-key whatever this node was last keyed at, at `t`.

        A dwell is not decoration: without it the exporter's ease runs a joint
        continuously from one move into the next and the machine reads as a
        toy. It is also nearly free — the exporter's key optimiser collapses a
        constant run.
        """
        full = self._full(node)
        ks = self._keys.get(full)
        if not ks:
            raise ValueError('%s: hold(%r) before any key on that node' % (self.name, node))
        last = ks[-1]
        if last[0] >= t:
            raise ValueError('%s: hold(%r, %.3f) is not after its last key at %.3f'
                             % (self.name, node, t, last[0]))
        ks.append((float(t), last[1], last[2], last[3]))
        return self

    # ── internals ───────────────────────────────────────────────────────────
    def _full(self, node):
        if node.startswith(R.NODE_PIVOT) or node.startswith(R.NODE_SLIDE):
            return node
        raise ValueError(
            '%s: %r is not a driveable node name. A clip may only key nodes '
            'named %r or %r — mount:/aim: are FIXED attachment points the game '
            'reads and never drives (rig.py, contract 1), and a static mesh has '
            'been joined away by the time a clip is baked.'
            % (self.name, node, R.NODE_PIVOT, R.NODE_SLIDE))

    def _key(self, node, t, want_prefix, rot=None, move=None, interp='BEZIER'):
        full = self._full(node)
        if not full.startswith(want_prefix):
            raise ValueError(
                '%s: %s is a %r node and this call keys a %r. rig.py names the two '
                'kinds apart on purpose: the game ROTATES a pivot: and TRANSLATES a '
                'slide:. If this part needs both, the machine module has to give it '
                'both nodes — do not overload one.'
                % (self.name, full, full.split(':')[0] + ':', want_prefix))
        t = float(t)
        if t < 0:
            raise ValueError('%s: %s keyed at t=%.3f — clips start at 0' % (self.name, full, t))
        ks = self._keys.setdefault(full, [])
        if full not in self._order:
            self._order.append(full)
        if ks and t <= ks[-1][0]:
            raise ValueError('%s: %s keyed at t=%.3f, not after its previous key at '
                             '%.3f. Keys are authored in time order so the sequence '
                             'reads as a sequence.' % (self.name, full, t, ks[-1][0]))
        if rot is not None and ks and ks[-1][1] is not None:
            paxis, pdeg = ks[-1][1]
            if paxis != rot[0]:
                raise ValueError(
                    '%s: %s turns about %s and its previous key turns about %s. One '
                    'pivot, one axis, per clip — interpolating between two axes is a '
                    'path nobody authored.' % (self.name, full, rot[0], paxis))
            if abs(rot[1] - pdeg) > 180.0 + 1e-9:
                # A glTF rotation channel is a quaternion, and slerp always takes
                # the short arc: a step of more than half a turn arrives going the
                # WRONG WAY, and more than a full turn does not arrive at all.
                # Measured: 1080 deg keyed in one step exported as two identity
                # keys and the spindle stood still. Use spin().
                raise ValueError(
                    '%s: %s steps %.1f deg between keys (%.1f -> %.1f). A glTF '
                    'rotation is a QUATERNION — over 180 deg it interpolates the '
                    'short way round, and a whole turn is indistinguishable from '
                    'none. Use Clip.spin(), which breaks a turn into steps.'
                    % (self.name, full, abs(rot[1] - pdeg), pdeg, rot[1]))
        ks.append((t, rot, move, interp))
        return self

    @property
    def duration(self):
        return max((ks[-1][0] for ks in self._keys.values()), default=0.0)

    def nodes(self):
        return list(self._order)


# ═════════════════════════════════════════════════════════════════════════════
# Baking — clips onto real Blender objects
# ═════════════════════════════════════════════════════════════════════════════

_AXIS = {'X': Vector((1, 0, 0)), 'Y': Vector((0, 1, 0)), 'Z': Vector((0, 0, 1))}


def _resolve(name, clip_name):
    o = bpy.data.objects.get(name)
    if o is not None:
        return o
    have = sorted(n.name for n in bpy.data.objects
                  if n.name.startswith(R.NODE_PIVOT) or n.name.startswith(R.NODE_SLIDE))
    raise KeyError(
        'clip %r keys %r and this machine has no such node. It has: %s'
        % (clip_name, name, ', '.join(have) or '(none — was the machine built?)'))


def _check_travel(o, axis, metres, rest, clip_name):
    """A slide that leaves its declared stroke is a clip that will look right in
    Blender and be wrong on the machine.

    `travel_m` is also the field `gltfRig.js:makeDyn()` needs to publish a
    carriage at all: without it `setCarriage()` computes `-0 * undefined` and
    writes NaN into a world matrix, and the machine SILENTLY DISAPPEARS. So a
    slide with no declared travel is not quietly accepted here either — it is
    reported, loudly, once per node, because it is the same missing fact.
    """
    x = o.get('travel_m')
    lo, hi = o.get('travel_min_m'), o.get('travel_max_m')
    if x is None and lo is None:
        print('ANIM_WARN  %s: %s declares no travel_m — a clip cannot be checked '
              'against a stroke that is not stated, and gltfRig.js cannot publish '
              'this slide as a carriage either (it needs travel_m or it writes NaN).'
              % (clip_name, o.name))
        return
    if x is not None and abs(metres) - float(x) > 1e-6:
        raise ValueError('%s: %s slides %.3f m and its declared travel_m is %.3f m.'
                         % (clip_name, o.name, abs(metres), float(x)))
    if lo is not None and hi is not None and axis == 'Z':
        end = float(rest[2]) + metres
        if end < float(lo) - 1e-6 or end > float(hi) + 1e-6:
            raise ValueError(
                '%s: %s would reach z=%.3f and its declared stroke is %.3f..%.3f '
                '(rest %.3f, delta %+.3f).'
                % (clip_name, o.name, end, float(lo), float(hi), rest[2], metres))


def _ensure_slot(o, action):
    """Put this object on `action`, in its own slot.

    One action holding one slot per object is what makes a multi-joint clip come
    out of the exporter as ONE glTF animation. Measured on Blender 5.2.1:
    `export_animation_mode` defaults to ACTIONS and `export_merge_animation` to
    ACTION, so the slots of a single action merge into a single animation named
    after the action — which is precisely the container a clip needs, and it
    means `rig.finish()` needs no new argument and no edit.
    """
    o.animation_data_create()
    if o.animation_data.action is not action:
        o.animation_data.action = action
    if o.animation_data.action_slot is None:
        o.animation_data.action_slot = action.slots.new(id_type='OBJECT', name=o.name)
    return o.animation_data.action_slot


def bake(clips, fps=FPS):
    """Key every clip onto the machine currently in the scene.

    Call this AFTER the machine module's `build()`. Its rest transforms are then
    the post-join ones that actually reached the file, which is the only set a
    delta can honestly be composed against.
    """
    if isinstance(clips, Clip):
        clips = [clips]
    scene = bpy.context.scene
    scene.render.fps = fps
    scene.frame_start = 0

    report = []
    end_frame = 0
    for clip in clips:
        action = bpy.data.actions.new(clip.name)
        if action.name != clip.name:
            # bpy.data.actions makes names unique by suffixing. A clip that came
            # out as `rod-change.001` would export under that name and
            # gltfAnim.play('rod-change') would find nothing, silently.
            raise ValueError('clip %r collides with an existing action, which Blender '
                             'renamed to %r. Two clips cannot share a name.'
                             % (clip.name, action.name))
        rows = []
        for name in clip.nodes():
            o = _resolve(name, clip.name)
            rest_loc = Vector(o.location)
            rest_quat = (o.rotation_quaternion.copy()
                         if o.rotation_mode == 'QUATERNION'
                         else o.rotation_euler.to_quaternion())
            # Rotate in quaternion space, always. Adding a delta into an euler
            # triple is only correct when the rest rotation is zero or shares the
            # delta's axis, and "correct on the machines we happen to have" is
            # how a pipeline acquires a silent special case.
            o.rotation_mode = 'QUATERNION'
            o.rotation_quaternion = rest_quat
            _ensure_slot(o, action)

            keys = clip._keys[name]
            extent = 0.0
            for (t, rot, move, interp) in keys:
                frame = round(t * fps)
                end_frame = max(end_frame, frame)
                if rot is not None:
                    axis, deg = rot
                    o.rotation_quaternion = rest_quat @ Quaternion(_AXIS[axis],
                                                                   math.radians(deg))
                    o.keyframe_insert(data_path='rotation_quaternion', frame=frame)
                    extent = max(extent, abs(deg))
                if move is not None:
                    axis, m = move
                    _check_travel(o, axis, m, rest_loc, clip.name)
                    o.location = rest_loc + _AXIS[axis] * m
                    o.keyframe_insert(data_path='location', frame=frame)
                    extent = max(extent, abs(m))

            # Interpolation per key, on the channels this node actually got.
            bag = action.layers[0].strips[0].channelbag(o.animation_data.action_slot)
            for fc in bag.fcurves:
                for i, kp in enumerate(fc.keyframe_points):
                    want = keys[min(i, len(keys) - 1)][3]
                    kp.interpolation = want

            kind = 'rot' if keys[0][1] is not None else 'move'
            rows.append((name, kind, len(keys), extent,
                         'deg' if kind == 'rot' else 'm'))
            # Leave the machine in its rest pose. The scene is exported next and
            # a node left at its last keyed value would ship a wrong REST TRS in
            # the node table — the clip would still play and the machine would
            # stand wrong whenever nothing was playing.
            o.location = rest_loc
            o.rotation_quaternion = rest_quat

        print('ANIM_CLIP  %-14s %6.2f s  %d node(s) @ %d fps'
              % (clip.name, clip.duration, len(rows), fps))
        for (name, kind, n, extent, unit) in rows:
            print('           %-22s %-4s %3d keys  max %+8.3f %s'
                  % (name, kind, n, extent, unit))
        report.append({'name': clip.name, 'duration': clip.duration,
                       'nodes': [r[0] for r in rows]})

    scene.frame_end = max(end_frame, 1)
    scene.frame_set(0)

    # The claim set, printed once, because this is the list `gltfAnim.js` has to
    # arbitrate and the list a reader of rigFactory.js needs in front of them.
    claimed = {}
    for r in report:
        for n in r['nodes']:
            claimed.setdefault(n, []).append(r['name'])
    print('ANIM_CLAIMS %d node(s) driven by clips:' % len(claimed))
    for n in sorted(claimed):
        print('           %-22s <- %s' % (n, ', '.join(claimed[n])))
    return report


# ═════════════════════════════════════════════════════════════════════════════
# Verification — off the exported file, not off the intent
# ═════════════════════════════════════════════════════════════════════════════

_COMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def _glb_json_and_bin(path):
    with open(path, 'rb') as f:
        data = f.read()
    if len(data) < 20 or struct.unpack('<I', data[0:4])[0] != 0x46546C67:
        raise ValueError('%s is not a GLB' % path)
    jlen = struct.unpack('<I', data[12:16])[0]
    js = json.loads(data[20:20 + jlen].decode('utf-8'))
    bin_off = 20 + jlen + 8         # JSON chunk, then the BIN chunk header
    return js, data, bin_off


def _read_accessor(js, data, bin_off, idx):
    a = js['accessors'][idx]
    bv = js['bufferViews'][a['bufferView']]
    if a.get('componentType') != 5126:
        raise ValueError('accessor %d is not float32 — animation input/output must be'
                         % idx)
    n = a['count'] * _COMP[a['type']]
    off = bin_off + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    return list(struct.unpack_from('<%df' % n, data, off)), a['count'], _COMP[a['type']]


def verify(path, clips, tol=REST_TOL):
    """Read the exported file back and check the clips are in it and correct.

    This is the whole reason to trust anything above. Every failure mode this
    pipeline has actually had — a name that survived while its position did not,
    a builder with no call sites, a material silently substituted — produced a
    clean log. So this opens the artifact.
    """
    if isinstance(clips, Clip):
        clips = [clips]
    js, data, bin_off = _glb_json_and_bin(path)
    nodes = js.get('nodes', [])
    by_name = {}
    for i, n in enumerate(nodes):
        if n.get('name'):
            by_name.setdefault(n['name'], []).append(i)
    anims = {a.get('name'): a for a in js.get('animations', [])}

    problems = []
    print('ANIM_VERIFY %s' % os.path.basename(path))
    for clip in clips:
        a = anims.get(clip.name)
        if a is None:
            problems.append('clip %r is NOT in the exported file (it has: %s)'
                            % (clip.name, ', '.join(anims) or 'no animations at all'))
            continue
        seen = {}
        for ch in a['channels']:
            ni = ch['target']['node']
            nm = nodes[ni].get('name')
            s = a['samplers'][ch['sampler']]
            times, ntimes, _ = _read_accessor(js, data, bin_off, s['input'])
            vals, nvals, comp = _read_accessor(js, data, bin_off, s['output'])
            # How far the channel actually MOVES in the file. A channel that was
            # keyed to move and exports flat is the failure that costs a day:
            # 1080 deg of spindle keyed in one step is the identity quaternion,
            # so every sample was equal, the optimiser collapsed 402 keys to 2,
            # and the head stood still with a clean log. Measure the span.
            span = max(max(vals[c::comp]) - min(vals[c::comp]) for c in range(comp))
            # How far a rotation channel actually TURNS in the file: the sum of
            # the short arcs between consecutive keys. Compared below against
            # what the clip asked for, because "the channel is not flat" is a
            # much weaker statement than "the channel turns the right amount",
            # and the difference between them was 900 degrees of spindle.
            swept = 0.0
            if ch['target']['path'] == 'rotation':
                for k in range(1, ntimes):
                    qa = vals[(k - 1) * 4:k * 4]
                    qb = vals[k * 4:(k + 1) * 4]
                    dot = min(1.0, abs(sum(x * y for x, y in zip(qa, qb))))
                    swept += math.degrees(2.0 * math.acos(dot))
            seen.setdefault(nm, []).append((ch['target']['path'], ntimes,
                                            times[0], times[-1], vals[:comp], span,
                                            swept))

        for name in clip.nodes():
            if name not in by_name:
                problems.append('%s: node %r is not in the file at all' % (clip.name, name))
                continue
            if len(by_name[name]) > 1:
                problems.append('%s: %d nodes are called %r — a channel target is '
                                'ambiguous' % (clip.name, len(by_name[name]), name))
            if name not in seen:
                problems.append('%s: %r was keyed but the file has no channel for it '
                                '(the exporter dropped it — check the action slot)'
                                % (clip.name, name))
                continue
            rest = nodes[by_name[name][0]]
            # What the CLIP says this node does, to compare against what the FILE
            # says it does. Keyed-but-flat is the whole point of this check.
            ks = clip._keys[name]
            declared = {'rotation': max(abs(k[1][1] - ks[0][1][1])
                                        for k in ks if k[1] is not None) if ks[0][1] else 0.0,
                        'translation': max(abs(k[2][1] - ks[0][2][1])
                                           for k in ks if k[2] is not None) if ks[0][2] else 0.0}
            # Total path, not net displacement: three turns out and three back is
            # 2160 degrees of work and 0 degrees of net rotation.
            want_swept = sum(abs(ks[i][1][1] - ks[i - 1][1][1])
                             for i in range(1, len(ks))
                             if ks[i][1] is not None and ks[i - 1][1] is not None)
            for (pathname, nk, t0, t1, first, span, swept) in seen[name]:
                want = (rest.get('translation', [0, 0, 0]) if pathname == 'translation'
                        else rest.get('rotation', [0, 0, 0, 1]) if pathname == 'rotation'
                        else None)
                d = (max(abs(f - w) for f, w in zip(first, want))
                     if want is not None else 0.0)
                flag = ''
                if declared.get(pathname, 0.0) > 1e-6 and span < 1e-5:
                    problems.append(
                        '%s/%s.%s is keyed to move %.3f but every value in the file is '
                        'the same (span %.3g). The channel exports flat — for a '
                        'rotation that is a turn of 360 deg or more keyed in one step, '
                        'which is the identity quaternion. Use Clip.spin().'
                        % (clip.name, name, pathname, declared[pathname], span))
                    flag = '  <-- KEYED BUT FLAT'
                if pathname == 'rotation' and want_swept > 1.0:
                    # 2 % of the authored path. The failure this catches was 42 %
                    # over — an interpolator overshooting a multi-turn quaternion
                    # — and it is invisible in a viewport and in every log line.
                    if abs(swept - want_swept) > 0.02 * want_swept:
                        problems.append(
                            '%s/%s.%s turns %.1f deg in the file and the clip asks for '
                            '%.1f deg (%+.1f %%). The interpolator is not tracking the '
                            'keys — key each exported frame (Clip.spin does).'
                            % (clip.name, name, pathname, swept, want_swept,
                               100.0 * (swept - want_swept) / want_swept))
                        flag = '  <-- WRONG SWEEP'
                if abs(t0) > 1e-6:
                    problems.append('%s/%s.%s starts at t=%.4f, not 0' % (
                        clip.name, name, pathname, t0))
                if want is not None and d > tol:
                    # The first key of a clip that starts at rest MUST equal the
                    # node's own rest TRS in the node table. If it does not, the
                    # clip and the machine disagree about where the part is, and
                    # the machine will jump the instant the clip is played.
                    problems.append(
                        '%s/%s.%s first key is %.5f off the node\'s rest %s — the '
                        'part would JUMP when the clip starts'
                        % (clip.name, name, pathname, d, pathname))
                    flag = '  <-- REST MISMATCH'
                print('           %-14s %-22s %-11s %4d keys  %.3f..%.3f s  '
                      'rest delta %.6f  span %.4f%s%s'
                      % (clip.name, name, pathname, nk, t0, t1, d, span,
                         ('  swept %.1f/%.1f deg' % (swept, want_swept))
                         if pathname == 'rotation' else '', flag))
            if abs(max(x[3] for x in seen[name]) - clip.duration) > 1.0 / FPS:
                problems.append('%s/%s ends at %.3f s and the clip declares %.3f s'
                                % (clip.name, name, max(x[3] for x in seen[name]),
                                   clip.duration))

    if problems:
        for p in problems:
            print('ANIM_FAIL  %s' % p)
        raise AssertionError('%d animation problem(s) in %s — see ANIM_FAIL above'
                             % (len(problems), path))
    print('ANIM_OK    %s  %d clip(s) verified against the file'
          % (os.path.basename(path), len(clips)))
    return True


# ═════════════════════════════════════════════════════════════════════════════
# The one entry point a motion module needs
# ═════════════════════════════════════════════════════════════════════════════

def build_with_motion(machine, out_path, clips, fps=FPS):
    """Build `machine` (an unmodified `blender/<machine>.py`), key `clips` onto
    it, re-export, and verify against the file.

    The machine module is IMPORTED AND CALLED, never edited: `build()` already
    ends in `rig.finish()`, so it joins the statics, restores the named nodes'
    world transforms and writes a static export. That export is the BASELINE —
    the same scene, the same options, the only difference being the animation —
    so the byte cost of motion is measured here exactly rather than estimated.
    """
    machine.build(out_path)
    static_bytes = os.path.getsize(out_path)

    bake(clips, fps=fps)
    # join_by_material=False: `build()` already joined, and joining a second time
    # would re-run the world-transform snapshot over nodes that now carry
    # animation. finish() otherwise exports with exactly the options the static
    # half is exported with — there is one export call in this pipeline, not two.
    R.finish(out_path, join_by_material=False)
    anim_bytes = os.path.getsize(out_path)

    verify(out_path, clips)
    total = sum(c.duration for c in ([clips] if isinstance(clips, Clip) else clips))
    print('ANIM_SIZE  %s  static %d B -> %d B  (+%d B, +%.2f %%) for %.1f s of clip @ %d fps'
          % (os.path.basename(out_path), static_bytes, anim_bytes,
             anim_bytes - static_bytes,
             100.0 * (anim_bytes - static_bytes) / max(1, static_bytes), total, fps))
    return {'path': out_path, 'static_bytes': static_bytes, 'bytes': anim_bytes,
            'delta': anim_bytes - static_bytes}
