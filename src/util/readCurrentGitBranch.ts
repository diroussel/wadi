import {execStr} from './execAsync';

export async function readCurrentGitBranch() {
	return execStr('git rev-parse --abbrev-ref HEAD');
}
