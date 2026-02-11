import { api } from '@/api/api';
import type {
	GetActiveClassesResponseData,
	GetAllClassesResponseData,
} from '@/types/services/classes';

////////////////////////////////////////////////////////////////////////////////

export async function getAllClasses() {
	const res = await api.get<GetAllClassesResponseData>('/classes/all');
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////

export async function getActiveClasses() {
	const res = await api.get<GetActiveClassesResponseData>('/classes/active');
	return res.data;
}

////////////////////////////////////////////////////////////////////////////////
