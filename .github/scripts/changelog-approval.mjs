import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const APPROVAL_MARKER = 'CHANGELOG-CHECKED';
const APPROVER_ROLES = new Set(['admin', 'maintain', 'write']);

export function isApprovalText(body) {
  const firstLine = String(body ?? '')
    .split(/\r?\n/)
    .find((line) => line.trim() !== '');
  return firstLine?.trim() === APPROVAL_MARKER;
}

// role is the collaborator API's role_name: the legacy `permission` field folds `maintain` into `write`.
export function isEligibleApprover({ userType, role }) {
  return userType !== 'Bot' && APPROVER_ROLES.has(role);
}

export async function evaluateApproval(comments, getRole) {
  const rejected = [];
  for (const comment of comments) {
    if (!isApprovalText(comment.body)) continue;
    const login = comment.user?.login;
    const userType = comment.user?.type;
    if (userType === 'Bot') {
      rejected.push({ login, reason: 'author is a bot' });
      continue;
    }
    const role = await getRole(login);
    if (!isEligibleApprover({ userType, role })) {
      rejected.push({ login, reason: `role "${role}" is not write, maintain or admin` });
      continue;
    }
    return { approved: true, approver: login, rejected };
  }
  return { approved: false, approver: null, rejected };
}

function main() {
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };
  const bodyFile = option('--body-file');
  const userType = option('--user-type');
  const role = option('--role');
  if (!bodyFile || !userType || !role) {
    console.error('Usage: node changelog-approval.mjs --body-file <file> --user-type <type> --role <role>');
    process.exit(2);
  }
  if (!isApprovalText(readFileSync(bodyFile, 'utf8'))) {
    console.log(`not eligible: first line is not exactly ${APPROVAL_MARKER}`);
    process.exit(1);
  }
  if (userType === 'Bot') {
    console.log('not eligible: author is a bot');
    process.exit(1);
  }
  if (!isEligibleApprover({ userType, role })) {
    console.log(`not eligible: role "${role}" is not write, maintain or admin`);
    process.exit(1);
  }
  console.log('eligible');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
