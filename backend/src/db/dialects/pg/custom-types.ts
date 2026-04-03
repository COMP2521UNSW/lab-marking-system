import { customType } from 'drizzle-orm/pg-core';
import { Temporal } from 'temporal-polyfill';

import type { EventType } from '@workspace/types/logs';
import type {
	ManualRequestStatus,
	RequestStatus,
} from '@workspace/types/requests';
import type { Time } from '@workspace/types/time';
import type { UserRole } from '@workspace/types/users';

const date = customType<{
	data: Temporal.PlainDate;
	driverData: string;
}>({
	dataType() {
		return 'date';
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
		return 'timestamp with time zone';
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
	date,
	eventEnum,
	manualRequestStatusEnum,
	requestStatusEnum,
	time,
	timestamp,
	userRoleEnum,
};
