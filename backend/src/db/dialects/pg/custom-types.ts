import { customType } from 'drizzle-orm/pg-core';

import type { EventType } from '@workspace/types/logs';
import type {
	ManualRequestStatus,
	RequestStatus,
} from '@workspace/types/requests';
import type { Time } from '@workspace/types/time';
import type { UserRole } from '@workspace/types/users';

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
	userRoleEnum,
};
