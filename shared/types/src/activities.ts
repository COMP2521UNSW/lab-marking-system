export type ActivityAsStudent = {
	code: string;
	name: string;
};

export type ActivityWithStatus = {
	activity: ActivityAsStudent;
	marked: boolean;
};

export type ActivityAsTutor = ActivityAsStudent & {
	maxMark: number;
};
