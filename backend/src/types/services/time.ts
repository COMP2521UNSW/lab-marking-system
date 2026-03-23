export interface TimeService {
	getCurrentTime(): Date;
	getCurrentWeek(): Promise<number>;
	termInProgress(): Promise<boolean>;
}
