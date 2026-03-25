import { devMode } from '@/lib/utils';

export function getDate() {
	return devMode() ? getFakeDate() : new Date();
}

function getFakeDate() {
	return new Date(2026, 3, 2, 16, 50);
}
