/** Exact literal patcher: fails loudly if a target is absent or ambiguous. */
import { readFileSync, writeFileSync } from 'node:fs';
export function patch(file, edits) {
  let src = readFileSync(file, 'utf8');
  for (const [find, repl] of edits) {
    const n = src.split(find).length - 1;
    if (n !== 1) { console.error(`FAIL ${file}: ${n} matches for:\n---\n${find}\n---`); process.exit(1); }
    src = src.replace(find, repl);
  }
  writeFileSync(file, src, 'utf8');
  console.log(`ok ${file}  (${edits.length} edits)`);
}
