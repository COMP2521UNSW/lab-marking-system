import type { Class, ClassDetails } from '../classes';

////////////////////////////////////////////////////////////////////////////////

export interface ClassesService {
	getAllClasses(): Promise<GetAllClassesResponseData>;
	getActiveClasses(): Promise<GetActiveClassesResponseData>;
}

////////////////////////////////////////////////////////////////////////////////

export type GetAllClassesResponseData = ClassDetails[];

export type GetActiveClassesResponseData = {
	current: Class[];
	upcoming: Class[];
	recent: Class[];
};
