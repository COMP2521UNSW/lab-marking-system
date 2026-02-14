import { expect, test } from '@jest/globals';

import { mergeDiffs } from '@/scripts/sync-marks';

test('diffs should be sorted correctly', () => {
	const dbDiffs = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
		{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
	];

	const smsDiffs = [
		{ zid: '5000000', code: 'lab01', smsName: 'lab01_subj', mark: 3 },
		{ zid: '5000000', code: 'lab02', smsName: 'lab02_subj', mark: 2.5 },
		{ zid: '5111111', code: 'lab03', smsName: 'lab03_subj', mark: 4.5 },
		{ zid: '5222222', code: 'lab02', smsName: 'lab02_subj', mark: 1 },
		{ zid: '5333333', code: 'lab03', smsName: 'lab03_subj', mark: 5 },
	];

	const diffs = mergeDiffs(dbDiffs, smsDiffs);

	expect(diffs).toStrictEqual({
		fromDb: [
			{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
			{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
			{ zid: '5333333', code: 'lab01', smsName: 'lab01_subj', mark: 1.5 },
			{ zid: '5333333', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
		],
		fromSms: [
			{ zid: '5000000', code: 'lab01', smsName: 'lab01_subj', mark: 3 },
			{ zid: '5000000', code: 'lab02', smsName: 'lab02_subj', mark: 2.5 },
			{ zid: '5111111', code: 'lab03', smsName: 'lab03_subj', mark: 4.5 },
			{ zid: '5222222', code: 'lab02', smsName: 'lab02_subj', mark: 1 },
			{ zid: '5333333', code: 'lab03', smsName: 'lab03_subj', mark: 5 },
		],
	});
});

test('diffs from SMS should take priority', () => {
	const dbDiffs = [
		{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 },
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.8 },
		{ zid: '5222222', code: 'lab01', smsName: 'lab01_subj', mark: 3 },
	];

	const smsDiffs = [
		{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
		{ zid: '5222222', code: 'lab01', smsName: 'lab01_subj', mark: null },
	];

	const diffs = mergeDiffs(dbDiffs, smsDiffs);

	expect(diffs).toStrictEqual({
		fromDb: [
			{ zid: '5111111', code: 'lab01', smsName: 'lab01_subj', mark: 2 }, //
		],
		fromSms: [
			{ zid: '5111111', code: 'lab02', smsName: 'lab02_subj', mark: 0.9 },
			{ zid: '5222222', code: 'lab01', smsName: 'lab01_subj', mark: null },
		],
	});
});
