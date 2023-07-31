import {execStr} from './exec-async';

export async function findGitRepoRoot() {
	return await execStr('git rev-parse --show-toplevel');
}
