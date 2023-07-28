import { execStr } from './execAsync';

export async function readCurrentGitBranch() {
  return await execStr('git rev-parse --abbrev-ref HEAD');
}
