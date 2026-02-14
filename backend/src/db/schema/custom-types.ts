import { customType } from 'drizzle-orm/sqlite-core';

import type { EventType } from '@/types/log';
import type { ManualRequestStatus, RequestStatus } from '@/types/requests';
import type { Time } from '@/types/time';
import type { UserRole } from '@/types/users';

const boolean = customType<{
	data: boolean;
	driverData: number;
}>({
	dataType() {
		return `integer`;
	},
	toDriver(value: boolean) {
		return value ? 1 : 0;
	},
	fromDriver(value: number) {
		return value === 1 ? true : false;
	},
});

const timestamp = customType<{
	data: Date;
	driverData: string;
	config: { withTimezone: boolean };
}>({
	dataType(config) {
		return `timestamp${config?.withTimezone ? ' with time zone' : ''}`;
	},
	fromDriver(value: string): Date {
		return new Date(value);
	},
});

const time = customType<{
	data: Time;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
});

const userRoleEnum = customType<{
	data: UserRole;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
});

const requestStatusEnum = customType<{
	data: RequestStatus;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
});

const manualRequestStatusEnum = customType<{
	data: ManualRequestStatus;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
});

const eventEnum = customType<{
	data: EventType;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
});

export {
	boolean,
	eventEnum,
	manualRequestStatusEnum,
	requestStatusEnum,
	time,
	timestamp,
	userRoleEnum,
};
