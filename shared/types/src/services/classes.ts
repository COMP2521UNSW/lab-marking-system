import type { Class, ClassDetails } from '../classes';

export type GetAllClassesResponseData = ClassDetails[];

export type GetActiveClassesResponseData = {
	current: Class[];
	upcoming: Class[];
	recent: Class[];
};
