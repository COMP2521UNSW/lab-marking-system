import type { TimeService } from '@/types/services/time';

class FakeBackendTimeService implements TimeService {
	getCurrentTime() {
		return new Date(2026, 3, 2, 16, 50);
	}

	async getCurrentWeek() {
		return new Promise<number>((res) => res(7));
	}

	async termInProgress() {
		return new Promise<boolean>((res) => res(true));
	}
}

const fakeTimeService: TimeService = new FakeBackendTimeService();

export default fakeTimeService;
