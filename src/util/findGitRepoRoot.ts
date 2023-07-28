import { execStr } from './execAsync';

export async function findGitRepoRoot() {
  return await execStr('git rev-parse --show-toplevel');
}
