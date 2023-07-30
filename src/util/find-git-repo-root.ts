import {execStr} from './exec-async';

export async function findGitRepoRoot() {
	return execStr('git rev-parse --show-toplevel');
}
