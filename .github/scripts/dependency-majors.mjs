import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

function parseSpec(spec) {
  if (typeof spec !== 'string') return null;
  const match = /^(?:\^|~|>=|=|v)*(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:[-+][0-9A-Za-z.+-]*)?$/.exec(spec.trim());
  if (!match) return null;
  return [match[1], match[2] ?? '0', match[3] ?? '0'].map(Number);
}

// 0.45 -> 0.46 is a major; 0.0.3 -> 0.0.4 is not (npm's caret would say it is, but it is mostly noise).
function compatibilityKey(parts) {
  const length = parts[0] === 0 ? 2 : 1;
  return parts.slice(0, length).join('.');
}

export function findDependencyMajors(beforePkg, afterPkg) {
  const majors = [];
  for (const section of SECTIONS) {
    const before = beforePkg?.[section] ?? {};
    const after = afterPkg?.[section] ?? {};
    for (const name of Object.keys(after)) {
      if (!(name in before)) continue;
      const beforeParts = parseSpec(before[name]);
      const afterParts = parseSpec(after[name]);
      if (!beforeParts || !afterParts) continue;
      if (compatibilityKey(beforeParts) !== compatibilityKey(afterParts)) {
        majors.push({ name, section, before: before[name], after: after[name] });
      }
    }
  }
  return majors;
}

export function formatMajorsMarkdown(majors) {
  const rows = majors.map((major) => `| \`${major.name}\` | \`${major.before}\` | \`${major.after}\` |`);
  return ['| Package | Before | After |', '| --- | --- | --- |', ...rows].join('\n');
}

function main() {
  const [beforeFile, afterFile] = process.argv.slice(2);
  if (!beforeFile || !afterFile) {
    console.error('Usage: node dependency-majors.mjs <before.json> <after.json>');
    process.exit(2);
  }
  const majors = findDependencyMajors(
    JSON.parse(readFileSync(beforeFile, 'utf8')),
    JSON.parse(readFileSync(afterFile, 'utf8')),
  );
  const markdown = formatMajorsMarkdown(majors);
  console.log(JSON.stringify({ hasMajors: majors.length > 0, count: majors.length, majors, markdown }));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `has_majors=${majors.length > 0}\ncount=${majors.length}\n`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
