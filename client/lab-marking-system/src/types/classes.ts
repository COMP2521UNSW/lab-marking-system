export type Class = {
	code: string;
	labLocation: string;
};

export type ClassDetails = {
	code: string;
	dayOfWeek: number;
	labStartTime: string;
	labEndTime: string;
	labLocation: string;
};

export type ActiveClasses = {
	current: Class[];
	upcoming: Class[];
	recent: Class[];
};
