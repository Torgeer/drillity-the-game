/** Grade actual captures. Missing evidence is a failed QA run, not a fast game. */
export function assessQaRun({ shots = [], budget = {}, headed, render, skipped = [], logs = [] }) {
  const over = { surface: [], section: [], rig: [], fps: [], tex: [], particles: [] };
  const failures = [];
  const incomplete = [];
  for (const name of ['surface', 'section', 'rig', 'fps', 'textureMB', 'particles']) {
    if (!Number.isFinite(budget[name]) || budget[name] <= 0) failures.push(`${name}: invalid or missing QA budget`);
  }
  if (!shots.some((r) => !r.skipped)) incomplete.push('no states were captured');
  if (!render?.ok) failures.push('the renderer did not prove a live drawing buffer');
  for (const s of skipped) incomplete.push(`${s.id}: requested state could not be captured`);
  if (logs.some((l) => /^\[(error|pageerror)\]/.test(l) || /Shader Error|program not valid/i.test(l))) {
    failures.push('the browser reported runtime or shader errors');
  }
  for (const r of shots) {
    if (r.skipped) { incomplete.push(`${r.id}: requested state could not be captured (${r.skipped})`); continue; }
    if (r.setupError) failures.push(`${r.id}: setup failed`);
    if (r.failed?.length) failures.push(`${r.id}: ${r.failed.join('; ')}`);
    if (r.ident?.bit?.fits === false) failures.push(`${r.id}: fitted bit does not fit the method`);
    const m = r.metrics;
    if (!m || m.error) { incomplete.push(`${r.id}: metrics unavailable`); continue; }
    if (m.ctxLost) failures.push(`${r.id}: WebGL context was lost`);
    for (const name of ['surface', 'section', 'rig']) {
      const calls = m[name]?.calls;
      if (!Number.isInteger(calls) || calls <= 0) incomplete.push(`${r.id}: ${name} has no valid positive draw-call measurement`);
      else if (calls > budget[name]) over[name].push(`${r.id}=${calls}`);
    }
    if (!Number.isFinite(m.texEstMB) || m.texEstMB <= 0) incomplete.push(`${r.id}: texture memory unavailable`);
    else if (m.texEstMB > budget.textureMB) over.tex.push(`${r.id}=${m.texEstMB}MB`);
    if (!Number.isInteger(m.particles?.live) || m.particles.live < 0) incomplete.push(`${r.id}: particle count unavailable`);
    else if (m.particles.live > budget.particles) over.particles.push(`${r.id}=${m.particles.live}`);
    // Cold or occluded frames cannot indict performance. They also cannot
    // establish that the game passed its documented frame-rate floor.
    if (!headed || !r.warm || m.throttled || !Number.isFinite(m.fps)) {
      incomplete.push(`${r.id}: no warm, unthrottled GPU frame-rate measurement`);
    } else if (m.fps < budget.fps) over.fps.push(`${r.id}=${m.fps}`);
  }
  const budgetFailed = Object.values(over).some((v) => v.length);
  const status = failures.length || budgetFailed ? 'FAIL' : incomplete.length ? 'INCOMPLETE' : 'PASS';
  return { over, failures, incomplete, status, exitCode: status === 'PASS' ? 0 : status === 'FAIL' ? 1 : 2 };
}
