const COURSE_CODE = 'COMP2521';

const SESSION = '26T1';

const LOCAL_TIME_ZONE = 'Australia/Sydney';

function getSubmissionLink(
	zid: string,
	activityCode: string,
): string | undefined {
	zid = zid.replace(/^z/, '');
	return `https://cgi.cse.unsw.edu.au/~cs2521/${SESSION}/view/${zid}/submission/${activityCode}/latest/`;
}

export { COURSE_CODE, LOCAL_TIME_ZONE, SESSION, getSubmissionLink };
