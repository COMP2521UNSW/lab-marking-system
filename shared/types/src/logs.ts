import type { Temporal } from 'temporal-polyfill';

import type { ActivityAsTutor } from './activities';

export type EventType =
	| 'class-changed'
	| 'request-created'
	| 'request-withdrawn'
	| 'request-declined'
	| 'request-marked'
	| 'mark-amended'
	| 'manual-request-created'
	| 'manual-request-approved'
	| 'manual-request-denied'
	| 'mark-imported-from-sms';

export type LogEvent =
	| ClassChangedEvent
	| RequestCreatedEvent
	| RequestWithdrawnEvent
	| RequestDeclinedEvent
	| RequestMarkedEvent
	| MarkAmendedEvent
	| ManualRequestCreatedEvent
	| ManualRequestApprovedEvent
	| ManualRequestDeniedEvent
	| MarkImportedFromSmsEvent;

interface BaseLogEvent {
	eventType: EventType;
	timestamp: Temporal.Instant;
}

export interface ClassChangedEvent extends BaseLogEvent {
	eventType: 'class-changed';
	classCode: string;
}

export interface RequestCreatedEvent extends BaseLogEvent {
	eventType: 'request-created';
	activity: ActivityAsTutor;
	classCode: string;
}

export interface RequestWithdrawnEvent extends BaseLogEvent {
	eventType: 'request-withdrawn';
	activity: ActivityAsTutor;
	classCode: string;
	reason: string;
}

export interface RequestDeclinedEvent extends BaseLogEvent {
	eventType: 'request-declined';
	activity: ActivityAsTutor;
	classCode: string;
	markerName: string;
	reason: string;
}

export interface RequestMarkedEvent extends BaseLogEvent {
	eventType: 'request-marked';
	activity: ActivityAsTutor;
	classCode: string;
	markerName: string;
	mark: number;
}

export interface MarkAmendedEvent extends BaseLogEvent {
	eventType: 'mark-amended';
	activity: ActivityAsTutor;
	classCode: string;
	markerName: string;
	mark: number;
}

export interface ManualRequestCreatedEvent extends BaseLogEvent {
	eventType: 'manual-request-created';
	activity: ActivityAsTutor;
	markerName: string;
	mark: number;
	reason: string;
}

export interface ManualRequestApprovedEvent extends BaseLogEvent {
	eventType: 'manual-request-approved';
	activity: ActivityAsTutor;
	approverName: string;
}

export interface ManualRequestDeniedEvent extends BaseLogEvent {
	eventType: 'manual-request-denied';
	activity: ActivityAsTutor;
	approverName: string;
	reason: string;
}

export interface MarkImportedFromSmsEvent extends BaseLogEvent {
	eventType: 'mark-imported-from-sms';
	activity: ActivityAsTutor;
	mark: number | null;
}
