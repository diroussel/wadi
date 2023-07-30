import {execStr} from './execAsync';

export async function findGitRepoRoot() {
	return execStr('git rev-parse --show-toplevel');
}
