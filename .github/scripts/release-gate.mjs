import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { evaluateApproval } from './changelog-approval.mjs';

export const CHECK_LABEL = 'changelog-check';

const labelNames = (labels) => (labels ?? []).map((label) => (typeof label === 'string' ? label : label.name));

export function uniquePullRequests(pullRequestLists) {
  const byNumber = new Map();
  for (const pullRequest of pullRequestLists.flat()) {
    if (!byNumber.has(pullRequest.number)) byNumber.set(pullRequest.number, pullRequest);
  }
  return [...byNumber.values()];
}

export function hasCheckLabel(pullRequest) {
  return labelNames(pullRequest.labels).includes(CHECK_LABEL);
}

export async function evaluateReleaseGate(pullRequests, getRole) {
  const unapproved = [];
  const approved = [];
  for (const pullRequest of pullRequests.filter(hasCheckLabel)) {
    const { approved: isApproved, approver, rejected } = await evaluateApproval(pullRequest.comments ?? [], getRole);
    const entry = { number: pullRequest.number, title: pullRequest.title, approver, rejected };
    (isApproved ? approved : unapproved).push(entry);
  }
  return { unapproved, approved };
}

export async function collectReleasePullRequests(shas, fetchPages) {
  const lists = [];
  for (const sha of shas) lists.push(await fetchPages(`commits/${sha}/pulls`));
  const merged = uniquePullRequests(lists).filter((pullRequest) => pullRequest.merged_at);
  const labelled = merged.filter(hasCheckLabel);
  const result = [];
  for (const pullRequest of labelled) {
    result.push({
      number: pullRequest.number,
      title: pullRequest.title,
      labels: labelNames(pullRequest.labels),
      comments: await fetchPages(`issues/${pullRequest.number}/comments`),
    });
  }
  return result;
}

function ghPages(path) {
  const output = execFileSync(
    'gh',
    ['api', '--paginate', '--slurp', `repos/${process.env.GITHUB_REPOSITORY}/${path}`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(output).flat();
}

function ghRole(login) {
  try {
    const output = execFileSync(
      'gh',
      ['api', `repos/${process.env.GITHUB_REPOSITORY}/collaborators/${login}/permission`, '--jq', '.role_name'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return output.trim() || 'none';
  } catch {
    return 'none';
  }
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };
  const shasFile = option('--shas-file');
  const inputFile = option('--input');
  if (!shasFile && !inputFile) {
    console.error('Usage: node release-gate.mjs --shas-file <file with one sha per line> | --input <pull requests json>');
    process.exit(2);
  }

  const pullRequests = inputFile
    ? JSON.parse(readFileSync(inputFile, 'utf8'))
    : await collectReleasePullRequests(
        readFileSync(shasFile, 'utf8').split('\n').map((line) => line.trim()).filter(Boolean),
        ghPages,
      );
  const result = await evaluateReleaseGate(pullRequests, ghRole);

  console.log(JSON.stringify(result));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      [
        `gate_passed=${result.unapproved.length === 0}`,
        `unapproved_prs=${result.unapproved.map(({ number }) => `#${number}`).join(', ')}`,
        `approved_count=${result.approved.length}`,
      ].join('\n') + '\n',
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
