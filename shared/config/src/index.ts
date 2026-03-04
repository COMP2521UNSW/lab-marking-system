import { removePrefix } from '@workspace/lib/string';

const COURSE_CODE = 'COMP2521';

const SESSION = '26T1';

const LOCAL_TIME_ZONE = 'Australia/Sydney';

function getSubmissionLink(zid: string, activityCode: string) {
	zid = removePrefix(zid, 'z');
	return `https://cgi.cse.unsw.edu.au/~cs2521/${SESSION}/view/${zid}/submission/${activityCode}/latest/`;
}

export { COURSE_CODE, LOCAL_TIME_ZONE, SESSION, getSubmissionLink };
