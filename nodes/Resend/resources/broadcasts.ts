import {
	INodeProperties,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { ResendResourceModule } from '../types';
import { buildTemplateVariablesField, buildEmailArrayField } from '../utils/fieldBuilders';
import { buildIdField, buildPaginationFields } from '../utils/commonFields';
import { splitEmails } from '../utils/attachmentHelpers';
import { processTemplateVariables } from '../utils/templateHelpers';
import { preparePaginatedRequest, processTemplateOrHtmlContent } from '../utils/requestBuilders';

// preSend hook for Create/Update Broadcast
async function prepareBroadcastRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: any = {};

	const segmentId = this.getNodeParameter('segmentId', '') as string;
	if (segmentId) {
		body.segment_id = segmentId;
	}

	body.from = this.getNodeParameter('from', '') as string;
	body.subject = this.getNodeParameter('subject', '') as string;

	const name = this.getNodeParameter('name', '') as string;
	if (name) {
		body.name = name;
	}

	// Template vs HTML content
	const contentFields = processTemplateOrHtmlContent.call(this, this, false);
	Object.assign(body, contentFields);

	// Topic
	const topicId = this.getNodeParameter('topicId', '') as string;
	if (topicId) {
		body.topic_id = topicId;
	}

	// Reply-to
	const replyTo = this.getNodeParameter('replyTo', '') as string;
	if (replyTo) {
		body.reply_to = splitEmails(replyTo);
	}

	// Validation
	if (!body.from || !body.subject) {
		throw new NodeOperationError(this.getNode(), 'From and Subject are required');
	}

	requestOptions.body = body;
	return requestOptions;
}

// preSend hook for Send Broadcast
async function prepareSendBroadcastRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const scheduledAt = this.getNodeParameter('scheduledAt', '') as string;

	// If scheduledAt is provided, include it. Otherwise, send empty body for immediate delivery
	if (scheduledAt && scheduledAt.trim() !== '') {
		requestOptions.body = {
			scheduled_at: scheduledAt,
		};
	} else {
		// Immediate send - empty body
		requestOptions.body = {};
	}

	return requestOptions;
}

export const broadcastsResource: ResendResourceModule = {
	description: {
		displayName: 'Broadcast',
		value: 'broadcasts',
		description: 'Manage and send broadcasts to segments',
	},

	operations: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new broadcast',
			action: 'Create a broadcast',
			routing: {
				request: {
					method: 'POST',
					url: '/broadcasts',
				},
				send: {
					preSend: [prepareBroadcastRequest],
				},
			},
		},
		{
			name: 'List',
			value: 'list',
			description: 'List all broadcasts',
			action: 'List broadcasts',
			routing: {
				request: {
					method: 'GET',
					url: '/broadcasts',
				},
				send: {
					preSend: [preparePaginatedRequest],
				},
			},
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Get a broadcast by ID',
			action: 'Get a broadcast',
			routing: {
				request: {
					method: 'GET',
					url: '=/broadcasts/{{$parameter.id}}',
				},
			},
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update a broadcast',
			action: 'Update a broadcast',
			routing: {
				request: {
					method: 'PATCH',
					url: '=/broadcasts/{{$parameter.id}}',
				},
				send: {
					preSend: [prepareBroadcastRequest],
				},
			},
		},
		{
			name: 'Send',
			value: 'send',
			description: 'Send a broadcast immediately or schedule for later',
			action: 'Send a broadcast',
			routing: {
				request: {
					method: 'POST',
					url: '=/broadcasts/{{$parameter.broadcastId}}/send',
				},
				send: {
					preSend: [prepareSendBroadcastRequest],
				},
			},
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a broadcast (draft only)',
			action: 'Delete a broadcast',
			routing: {
				request: {
					method: 'DELETE',
					url: '=/broadcasts/{{$parameter.id}}',
				},
			},
		},
	],

	fields: [
		// ================== CREATE/UPDATE BROADCAST FIELDS ==================
		{
			displayName: 'Segment',
			name: 'segmentId',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getSegments',
			},
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
				},
			},
			description: 'The segment to send this broadcast to',
		},
		{
			displayName: 'From',
			name: 'from',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Sender email address. Use format: "Name &lt;email@domain.com&gt;"',
			placeholder: 'Acme <newsletter@resend.dev>',
		},
		{
			displayName: 'Subject',
			name: 'subject',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Email subject line',
		},
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Internal reference name for this broadcast (optional)',
			placeholder: 'December Newsletter',
		},
		{
			displayName: 'Use Template',
			name: 'useTemplate',
			type: 'boolean',
			default: false,
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Whether to use a template or provide HTML content directly',
		},
		{
			displayName: 'Template',
			name: 'templateId',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getTemplates',
			},
			default: '',
			required: true,
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
					useTemplate: [true],
				},
			},
			description: 'The template to use for this broadcast',
		},
		buildTemplateVariablesField('broadcasts', ['create', 'update']),
		{
			displayName: 'HTML',
			name: 'html',
			type: 'string',
			typeOptions: {
				rows: 10,
			},
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
					useTemplate: [false],
				},
			},
			description:
				'HTML version of the email body. Use {{{FIRST_NAME|there}}} for variables and {{{RESEND_UNSUBSCRIBE_URL}}} for unsubscribe link.',
			placeholder:
				'<p>Hi {{{FIRST_NAME|there}}}, you can unsubscribe here: {{{RESEND_UNSUBSCRIBE_URL}}}</p>',
		},
		{
			displayName: 'Text',
			name: 'text',
			type: 'string',
			typeOptions: {
				rows: 5,
			},
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
					useTemplate: [false],
				},
			},
			description: 'Plain text version of the email (optional)',
		},
		{
			displayName: 'Topic',
			name: 'topicId',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getTopics',
			},
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Topic to scope this broadcast to (optional)',
		},
		buildEmailArrayField(
			'Reply To',
			'replyTo',
			'broadcasts',
			['create', 'update'],
			false,
			'Reply-to email addresses (comma-separated)',
		),

		// ================== SEND BROADCAST FIELDS ==================
		{
			displayName: 'Broadcast ID',
			name: 'broadcastId',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['send'],
				},
			},
			description: 'The ID of the broadcast to send',
		},
		{
			displayName: 'Scheduled At',
			name: 'scheduledAt',
			type: 'dateTime',
			default: '',
			displayOptions: {
				show: {
					resource: ['broadcasts'],
					operation: ['send'],
				},
			},
			description:
				'Schedule broadcast for later. Use natural language (e.g., "in 1 hour") or ISO 8601 format. Leave empty to send immediately.',
			placeholder: 'in 1 hour',
		},

		// ================== GET/UPDATE/DELETE BROADCAST FIELDS ==================
		buildIdField(
			'broadcasts',
			['get', 'update', 'delete'],
			'Broadcast ID',
			'The ID of the broadcast',
		),

		// ================== LIST BROADCASTS FIELDS ==================
		...buildPaginationFields('broadcasts', 'list'),
	],
};
