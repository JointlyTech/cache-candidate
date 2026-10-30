import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/;
const BREAKING_SUBJECT = /^\w+(\([^)]*\))?!:/;
const BREAKING_BODY = /^BREAKING[ -]CHANGE/m;
const FEAT_SUBJECT = /^feat(\([^)]*\))?:/;
const BUMP_RANK = { patch: 0, minor: 1, major: 2 };

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export function findLastTag(cwd = process.cwd()) {
  try {
    return git(['describe', '--tags', '--abbrev=0', '--match', 'v*'], cwd).trim();
  } catch {
    throw new Error('No v* tag reachable from HEAD: cannot compute a release bump');
  }
}

export function listCommitsSince(tag, cwd = process.cwd()) {
  const output = git(['log', `${tag}..HEAD`, '--format=%H%x1f%s%x1f%b%x1e'], cwd);
  return output
    .split('\x1e')
    .map((record) => record.replace(/^\n+/, ''))
    .filter((record) => record !== '')
    .map((record) => {
      const [sha, subject, body] = record.split('\x1f');
      return { sha, subject, body: (body ?? '').trim() };
    });
}

export function isBreaking(commit) {
  return BREAKING_SUBJECT.test(commit.subject) || BREAKING_BODY.test(commit.body ?? '');
}

export function breakingCommits(commits) {
  return commits.filter(isBreaking);
}

export function computeBump(commits) {
  if (commits.length === 0) return 'none';
  let bump = 'patch';
  for (const commit of commits) {
    const level = isBreaking(commit) ? 'major' : FEAT_SUBJECT.test(commit.subject) ? 'minor' : 'patch';
    if (BUMP_RANK[level] > BUMP_RANK[bump]) bump = level;
  }
  return bump;
}

export function nextVersion(tag, bump) {
  const match = TAG_PATTERN.exec(tag);
  if (!match) throw new Error(`Tag "${tag}" is not in vX.Y.Z form`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Unknown bump "${bump}"`);
}

export function analyzeRelease(cwd = process.cwd()) {
  const lastTag = findLastTag(cwd);
  const commits = listCommitsSince(lastTag, cwd);
  const bump = computeBump(commits);
  const packageVersion = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')).version;
  return {
    lastTag,
    commits,
    bump,
    nextVersion: bump === 'none' ? null : nextVersion(lastTag, bump),
    breaking: breakingCommits(commits),
    packageVersionMatches: packageVersion === lastTag.slice(1),
  };
}

function main() {
  let result;
  try {
    result = analyzeRelease();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      [
        `last_tag=${result.lastTag}`,
        `bump=${result.bump}`,
        `next_version=${result.nextVersion ?? ''}`,
        `package_version_matches=${result.packageVersionMatches}`,
        `commit_count=${result.commits.length}`,
        `breaking_count=${result.breaking.length}`,
      ].join('\n') + '\n',
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
