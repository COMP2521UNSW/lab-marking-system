import type {
	AuthService,
	GetUserResponseData,
	LogInRequestData,
	LogInResponseData,
} from '@workspace/types/services/auth';

import { api } from '@/api/api';

class FrontendAuthService implements AuthService {
	async logIn(req: LogInRequestData) {
		const res = await api.post<LogInResponseData>('/login', req);
		return res.data;
	}

	async logOut() {
		await api.post('/logout');
	}

	async getUser() {
		const res = await api.get<GetUserResponseData>('/user');
		return res.data;
	}
}

const authService: AuthService = new FrontendAuthService();

export default authService;
