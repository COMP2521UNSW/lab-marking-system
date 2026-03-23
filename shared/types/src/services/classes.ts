import type { Class } from '../classes';

////////////////////////////////////////////////////////////////////////////////

export interface ClassesService {
	getAllClasses(): Promise<GetAllClassesResponseData>;
	getActiveClasses(): Promise<GetActiveClassesResponseData>;
}

////////////////////////////////////////////////////////////////////////////////

export type GetAllClassesResponseData = Class[];

export type GetActiveClassesResponseData = {
	current: Class[];
	upcoming: Class[];
	recent: Class[];
};
