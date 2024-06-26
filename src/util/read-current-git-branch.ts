import { execStr } from './exec-async';

export async function readCurrentGitBranch() {
  return await execStr('git rev-parse --abbrev-ref HEAD');
}
