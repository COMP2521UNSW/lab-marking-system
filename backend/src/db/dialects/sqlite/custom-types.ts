import { customType } from 'drizzle-orm/sqlite-core';
import { Temporal } from 'temporal-polyfill';

import type { EventType } from '@workspace/types/logs';
import type {
	ManualRequestStatus,
	RequestStatus,
} from '@workspace/types/requests';
import type { Time } from '@workspace/types/time';
import type { UserRole } from '@workspace/types/users';

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

const date = customType<{
	data: Temporal.PlainDate;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
	toDriver(value: Temporal.PlainDate) {
		return value.toString();
	},
	fromDriver(value: string) {
		return Temporal.PlainDate.from(value);
	},
});

const timestamp = customType<{
	data: Temporal.Instant;
	driverData: string;
}>({
	dataType() {
		return 'text';
	},
	toDriver(value: Temporal.Instant) {
		return value.toString();
	},
	fromDriver(value: string) {
		return Temporal.Instant.from(value);
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
	date,
	eventEnum,
	manualRequestStatusEnum,
	requestStatusEnum,
	time,
	timestamp,
	userRoleEnum,
};
