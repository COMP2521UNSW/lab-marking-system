import type { ActivityAsTutor } from './activities';

export type EventType =
	| 'class-changed'
	| 'request-created'
	| 'request-withdrawn'
	| 'request-marked'
	| 'request-declined'
	| 'mark-amended'
	| 'manual-request-created'
	| 'manual-request-approved'
	| 'manual-request-denied'
	| 'mark-imported-from-sms';

export type RequestLogEvent =
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

interface BaseRequestLogEvent {
	eventType: EventType;
	timestamp: Date;
}

export interface ClassChangedEvent extends BaseRequestLogEvent {
	eventType: 'class-changed';
	classCode: string;
}

export interface RequestCreatedEvent extends BaseRequestLogEvent {
	eventType: 'request-created';
	activity: ActivityAsTutor;
	classCode: string;
}

export interface RequestWithdrawnEvent extends BaseRequestLogEvent {
	eventType: 'request-withdrawn';
	activity: ActivityAsTutor;
	classCode: string;
	reason: string;
}

export interface RequestDeclinedEvent extends BaseRequestLogEvent {
	eventType: 'request-declined';
	activity: ActivityAsTutor;
	classCode: string;
	markerName: string;
	reason: string;
}

export interface RequestMarkedEvent extends BaseRequestLogEvent {
	eventType: 'request-marked';
	activity: ActivityAsTutor;
	classCode: string;
	markerName: string;
	mark: number;
}

export interface MarkAmendedEvent extends BaseRequestLogEvent {
	eventType: 'mark-amended';
	activity: ActivityAsTutor;
	classCode: string;
	markerName: string;
	mark: number;
}

export interface ManualRequestCreatedEvent extends BaseRequestLogEvent {
	eventType: 'manual-request-created';
	activity: ActivityAsTutor;
	markerName: string;
	mark: number;
	reason: string;
}

export interface ManualRequestApprovedEvent extends BaseRequestLogEvent {
	eventType: 'manual-request-approved';
	activity: ActivityAsTutor;
	approverName: string;
}

export interface ManualRequestDeniedEvent extends BaseRequestLogEvent {
	eventType: 'manual-request-denied';
	activity: ActivityAsTutor;
	approverName: string;
	reason: string;
}

export interface MarkImportedFromSmsEvent extends BaseRequestLogEvent {
	eventType: 'mark-imported-from-sms';
	activity: ActivityAsTutor;
	mark: number | null;
}
