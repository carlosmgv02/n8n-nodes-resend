import { INodeProperties } from 'n8n-workflow';

// Resource types
export type ResendResource =
	| 'emails'
	| 'contacts'
	| 'segments'
	| 'broadcasts'
	| 'topics'
	| 'templates';

// Email operations
export type EmailOperation = 'send' | 'sendBatch' | 'list' | 'get' | 'cancel' | 'update';

// Contact operations
export type ContactOperation =
	| 'create'
	| 'list'
	| 'get'
	| 'update'
	| 'delete'
	| 'addToSegment'
	| 'removeFromSegment';

// Segment operations
export type SegmentOperation = 'create' | 'list' | 'get' | 'update' | 'delete';

// Broadcast operations
export type BroadcastOperation = 'create' | 'list' | 'get' | 'update' | 'send' | 'delete';

// Topic operations
export type TopicOperation = 'create' | 'list' | 'get' | 'update' | 'delete';

// Template operations (read-only)
export type TemplateOperation = 'list' | 'get';

// Attachment interface
export interface ResendAttachment {
	filename?: string;
	content?: string; // base64
	path?: string;
	content_type?: string;
	content_id?: string; // For inline images (CID)
}

// Template variable interface
export interface TemplateVariable {
	key: string;
	value: string | number;
}

// Tag interface
export interface EmailTag {
	name: string;
	value: string;
}

// Header interface
export interface EmailHeader {
	key: string;
	value: string;
}

// Contact properties interface
export interface ContactProperty {
	key: string;
	value: string | number;
	type?: 'string' | 'number';
}

// Pagination response
export interface PaginatedResponse<T> {
	object: 'list';
	data: T[];
	has_more: boolean;
}

// Domain interface
export interface Domain {
	id: string;
	name: string;
	status: string;
	created_at: string;
	region: string;
}

// Segment interface
export interface Segment {
	id: string;
	name: string;
	description?: string;
	created_at: string;
}

// Topic interface
export interface Topic {
	id: string;
	name: string;
	description?: string;
	default_subscription: 'opt_in' | 'opt_out';
	visibility: 'public' | 'private';
	created_at: string;
}

// Template interface
export interface Template {
	id: string;
	name: string;
	alias?: string;
	subject?: string;
	from?: string;
	html?: string;
	status?: string;
	variables?: Array<{
		key: string;
		type: 'string' | 'number';
		fallback_value?: string | number;
	}>;
	created_at: string;
}

// Request body types for improved type safety
export interface SendEmailRequestBody {
	from: string;
	to: string[];
	subject?: string;
	html?: string;
	text?: string;
	cc?: string[];
	bcc?: string[];
	reply_to?: string[];
	template?: {
		id: string;
		variables: Record<string, string | number>;
	};
	topic_id?: string;
	attachments?: ResendAttachment[];
	headers?: Record<string, string>;
	tags?: EmailTag[];
	scheduled_at?: string;
}

export interface BroadcastRequestBody {
	segment_id?: string;
	from: string;
	subject: string;
	name?: string;
	html?: string;
	text?: string;
	template?: {
		id: string;
		variables: Record<string, string | number>;
	};
	topic_id?: string;
	reply_to?: string[];
}

export interface ContactRequestBody {
	email?: string;
	first_name?: string;
	last_name?: string;
	unsubscribed?: boolean;
	properties?: Record<string, string | number>;
}

export interface SegmentRequestBody {
	name: string;
	description?: string;
}

export interface TopicRequestBody {
	name?: string;
	description?: string;
	default_subscription?: 'opt_in' | 'opt_out';
	visibility?: 'public' | 'private';
}

export interface PaginationQuery {
	limit?: number;
	after?: string;
	before?: string;
}

// Resource module interface
export interface ResendResourceDescription {
	displayName: string;
	value: ResendResource;
	description: string;
}

export interface ResendOperationDescription {
	name: string;
	value: string;
	description: string;
	action: string;
	routing?: any;
}

export interface ResendResourceModule {
	description: ResendResourceDescription;
	operations: ResendOperationDescription[];
	fields: INodeProperties[];
}
