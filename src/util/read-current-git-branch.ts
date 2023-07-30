import {execStr} from './exec-async';

export async function readCurrentGitBranch() {
	return execStr('git rev-parse --abbrev-ref HEAD');
}
