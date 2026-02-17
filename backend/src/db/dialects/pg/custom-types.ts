import { customType } from 'drizzle-orm/pg-core';

import type { EventType } from '@workspace/types/logs';
import type {
	ManualRequestStatus,
	RequestStatus,
} from '@workspace/types/requests';
import type { UserRole } from '@workspace/types/users';

import type { Time } from '@/types/time';

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
	eventEnum,
	manualRequestStatusEnum,
	requestStatusEnum,
	time,
	timestamp,
	userRoleEnum,
};
