export type Mark = {
	zid: string;
	code: string;
	smsName: string;
	mark: number | null;
};

/**
 * Assumes that oldMarks and newMarks are sorted
 */
export function getDiffs(oldMarks: Mark[], newMarks: Mark[]) {
	const diffs: Mark[] = [];

	let i = 0;
	let j = 0;
	while (i < oldMarks.length || j < newMarks.length) {
		if (j === newMarks.length) {
			break;
		} else if (i === oldMarks.length) {
			if (newMarks[j].mark !== null) {
				diffs.push(newMarks[j]);
			}
			j++;
		} else if (lessThan(oldMarks[i], newMarks[j])) {
			// should not be possible - all entries in old marks should appear in
			// new marks
			i++;
		} else if (lessThan(newMarks[j], oldMarks[i])) {
			if (newMarks[j].mark !== null) {
				diffs.push(newMarks[j]);
			}
			j++;
		} else {
			if (oldMarks[i].mark !== newMarks[j].mark) {
				diffs.push(newMarks[j]);
			}
			i++;
			j++;
		}
	}

	return diffs;
}

export function mergeDiffs(dbDiffs: Mark[], smsDiffs: Mark[]) {
	const fromDb: Mark[] = [];
	const fromSms: Mark[] = [];

	let i = 0;
	let j = 0;
	while (i < dbDiffs.length || j < smsDiffs.length) {
		if (j === smsDiffs.length) {
			fromDb.push(dbDiffs[i++]);
		} else if (i === dbDiffs.length) {
			fromSms.push(smsDiffs[j++]);
		} else if (lessThan(dbDiffs[i], smsDiffs[j])) {
			fromDb.push(dbDiffs[i++]);
		} else if (lessThan(smsDiffs[j], dbDiffs[i])) {
			fromSms.push(smsDiffs[j++]);
		} else {
			// if there are diffs from both DB and SMS, prioritise SMS
			fromSms.push(smsDiffs[j]);
			i++;
			j++;
		}
	}

	return { fromDb, fromSms };
}

function lessThan(a: Mark, b: Mark) {
	if (a.zid !== b.zid) {
		return a.zid < b.zid;
	} else {
		return a.code < b.code;
	}
}
