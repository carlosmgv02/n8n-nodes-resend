import {
	INodeProperties,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { ResendResourceModule } from '../types';
import {
	buildAttachmentField,
	buildTemplateVariablesField,
	buildKeyValuePairField,
	buildEmailArrayField,
} from '../utils/fieldBuilders';
import { buildIdField, buildPaginationFields } from '../utils/commonFields';
import { processAttachments, splitEmails, keyValuePairsToObject } from '../utils/attachmentHelpers';
import { processTemplateVariables, processEmailTags } from '../utils/templateHelpers';
import { preparePaginatedRequest, processTemplateOrHtmlContent } from '../utils/requestBuilders';
import { BATCH_EMAIL } from '../constants';

// preSend hook for Send Email operation
async function prepareSendEmailRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: any = {};

	// Required fields
	body.from = this.getNodeParameter('from', '') as string;
	const to = this.getNodeParameter('to', '') as string;
	body.to = splitEmails(to);

	// Optional recipients
	const cc = this.getNodeParameter('cc', '') as string;
	if (cc) {
		body.cc = splitEmails(cc);
	}

	const bcc = this.getNodeParameter('bcc', '') as string;
	if (bcc) {
		body.bcc = splitEmails(bcc);
	}

	const replyTo = this.getNodeParameter('replyTo', '') as string;
	if (replyTo) {
		body.reply_to = splitEmails(replyTo);
	}

	// Template vs HTML content
	const contentFields = processTemplateOrHtmlContent.call(this, this, true);
	Object.assign(body, contentFields);

	// Topic
	const topicId = this.getNodeParameter('topicId', '') as string;
	if (topicId) {
		body.topic_id = topicId;
	}

	// Attachments
	const attachmentsData = this.getNodeParameter('attachments', {}) as any;
	if (attachmentsData && attachmentsData.attachment?.length > 0) {
		body.attachments = await processAttachments.call(this, attachmentsData);
	}

	// Headers
	const headersData = this.getNodeParameter('headers', {}) as any;
	const headers = keyValuePairsToObject(headersData, 'header');
	if (headers) {
		body.headers = headers;
	}

	// Tags
	const tagsData = this.getNodeParameter('tags', {}) as any;
	const tags = processEmailTags(tagsData);
	if (tags) {
		body.tags = tags;
	}

	// Scheduling
	const scheduledAt = this.getNodeParameter('scheduledAt', '') as string;
	if (scheduledAt) {
		body.scheduled_at = scheduledAt;
	}

	// Validation
	if (!body.from || !body.to || body.to.length === 0) {
		throw new NodeOperationError(this.getNode(), 'From and To fields are required');
	}

	if (!body.template && !body.subject) {
		throw new NodeOperationError(this.getNode(), 'Subject is required when not using a template');
	}

	requestOptions.body = body;
	return requestOptions;
}

// preSend hook for Send Batch operation
async function prepareSendBatchRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const batchEmailsData = this.getNodeParameter('batchEmails', {}) as any;

	if (!batchEmailsData?.email || batchEmailsData.email.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one email is required for batch send');
	}

	const emails = [];

	for (const emailData of batchEmailsData.email) {
		const email: any = {
			from: emailData.from,
			to: splitEmails(emailData.to),
			subject: emailData.subject,
		};

		if (emailData.html) {
			email.html = emailData.html;
		}

		if (emailData.text) {
			email.text = emailData.text;
		}

		if (emailData.replyTo) {
			email.reply_to = splitEmails(emailData.replyTo);
		}

		// Validate at least html or text is provided
		if (!email.html && !email.text) {
			throw new NodeOperationError(
				this.getNode(),
				`Email "${email.subject}" must have at least HTML or Text content`,
			);
		}

		emails.push(email);
	}

	// Validate max batch emails
	if (emails.length > BATCH_EMAIL.MAX_COUNT) {
		throw new NodeOperationError(
			this.getNode(),
			`Batch send supports maximum ${BATCH_EMAIL.MAX_COUNT} emails, you provided ${emails.length}`,
		);
	}

	requestOptions.body = emails;
	return requestOptions;
}

export const emailsResource: ResendResourceModule = {
	description: {
		displayName: 'Email',
		value: 'emails',
		description: 'Send and manage emails',
	},

	operations: [
		{
			name: 'Send',
			value: 'send',
			description: 'Send an email',
			action: 'Send an email',
			routing: {
				request: {
					method: 'POST',
					url: '/emails',
				},
				send: {
					preSend: [prepareSendEmailRequest],
				},
			},
		},
		{
			name: 'Send Batch',
			value: 'sendBatch',
			description: 'Send up to 100 emails in a single request',
			action: 'Send batch emails',
			routing: {
				request: {
					method: 'POST',
					url: '/emails/batch',
				},
				send: {
					preSend: [prepareSendBatchRequest],
				},
			},
		},
		{
			name: 'List',
			value: 'list',
			description: 'List all sent emails',
			action: 'List emails',
			routing: {
				request: {
					method: 'GET',
					url: '/emails',
				},
				send: {
					preSend: [preparePaginatedRequest],
				},
			},
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Get an email by ID',
			action: 'Get an email',
			routing: {
				request: {
					method: 'GET',
					url: '=/emails/{{$parameter.id}}',
				},
			},
		},
		{
			name: 'Cancel',
			value: 'cancel',
			description: 'Cancel a scheduled email',
			action: 'Cancel a scheduled email',
			routing: {
				request: {
					method: 'POST',
					url: '=/emails/{{$parameter.id}}/cancel',
				},
			},
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update a scheduled email',
			action: 'Update a scheduled email',
			routing: {
				request: {
					method: 'PATCH',
					url: '=/emails/{{$parameter.id}}',
				},
			},
		},
	],

	fields: [
		// ================== SEND EMAIL FIELDS ==================
		{
			displayName: 'From',
			name: 'from',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['emails'],
					operation: ['send'],
				},
			},
			description: 'Sender email address. Use format: "Name &lt;email@domain.com&gt;"',
			placeholder: 'Acme <onboarding@resend.dev>',
		},
		buildEmailArrayField(
			'To',
			'to',
			'emails',
			['send'],
			true,
			'Comma-separated list of recipient email addresses',
		),
		{
			displayName: 'Use Template',
			name: 'useTemplate',
			type: 'boolean',
			default: false,
			displayOptions: {
				show: {
					resource: ['emails'],
					operation: ['send'],
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
					resource: ['emails'],
					operation: ['send'],
					useTemplate: [true],
				},
			},
			description: 'The template to use for this email',
		},
		buildTemplateVariablesField('emails', ['send']),
		{
			displayName: 'Subject',
			name: 'subject',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['emails'],
					operation: ['send'],
					useTemplate: [false],
				},
			},
			description: 'Email subject line',
		},
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
					resource: ['emails'],
					operation: ['send'],
					useTemplate: [false],
				},
			},
			description: 'HTML version of the email body',
			placeholder: '<p>Hello {{name}}, welcome to our service!</p>',
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
					resource: ['emails'],
					operation: ['send'],
					useTemplate: [false],
				},
			},
			description: 'Plain text version of the email (optional)',
		},
		buildEmailArrayField(
			'CC',
			'cc',
			'emails',
			['send'],
			false,
			'Carbon copy recipients (comma-separated)',
		),
		buildEmailArrayField(
			'BCC',
			'bcc',
			'emails',
			['send'],
			false,
			'Blind carbon copy recipients (comma-separated)',
		),
		buildEmailArrayField(
			'Reply To',
			'replyTo',
			'emails',
			['send'],
			false,
			'Reply-to email addresses (comma-separated)',
		),
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
					resource: ['emails'],
					operation: ['send'],
				},
			},
			description: 'Topic for email preferences and unsubscribe management',
		},
		buildAttachmentField('emails', ['send']),
		buildKeyValuePairField(
			'Headers',
			'headers',
			'emails',
			['send'],
			'Custom headers for the email',
			'header',
		),
		buildKeyValuePairField(
			'Tags',
			'tags',
			'emails',
			['send'],
			'Tags for tracking and categorization',
			'tag',
		),
		{
			displayName: 'Scheduled At',
			name: 'scheduledAt',
			type: 'dateTime',
			default: '',
			displayOptions: {
				show: {
					resource: ['emails'],
					operation: ['send'],
				},
			},
			description:
				'Schedule email for later. Use natural language (e.g., "in 1 hour") or ISO 8601 format.',
			placeholder: 'in 1 hour',
		},

		// ================== SEND BATCH FIELDS ==================
		{
			displayName: 'Emails',
			name: 'batchEmails',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			default: {},
			displayOptions: {
				show: {
					resource: ['emails'],
					operation: ['sendBatch'],
				},
			},
			description: 'Add up to 100 emails to send in a single batch request',
			placeholder: 'Add Email',
			options: [
				{
					displayName: 'Email',
					name: 'email',
					values: [
						{
							displayName: 'From',
							name: 'from',
							type: 'string',
							default: '',
							required: true,
							description: 'Sender email address. Format: "Name &lt;email@domain.com&gt;"',
							placeholder: 'Acme <onboarding@resend.dev>',
						},
						{
							displayName: 'To',
							name: 'to',
							type: 'string',
							default: '',
							required: true,
							description: 'Recipient email addresses (comma-separated)',
							placeholder: 'user@example.com, admin@example.com',
						},
						{
							displayName: 'Subject',
							name: 'subject',
							type: 'string',
							default: '',
							required: true,
							description: 'Email subject line',
						},
						{
							displayName: 'HTML',
							name: 'html',
							type: 'string',
							typeOptions: {
								rows: 5,
							},
							default: '',
							description: 'HTML content of the email (required if Text is empty)',
						},
						{
							displayName: 'Text',
							name: 'text',
							type: 'string',
							typeOptions: {
								rows: 3,
							},
							default: '',
							description: 'Plain text content (required if HTML is empty)',
						},
						{
							displayName: 'Reply To',
							name: 'replyTo',
							type: 'string',
							default: '',
							description: 'Reply-to email addresses (comma-separated, optional)',
							placeholder: 'support@example.com',
						},
					],
				},
			],
		},

		// ================== LIST EMAILS FIELDS ==================
		...buildPaginationFields('emails', 'list'),

		// ================== GET/CANCEL/UPDATE EMAIL FIELDS ==================
		buildIdField('emails', ['get', 'cancel', 'update'], 'Email ID', 'The ID of the email'),
	],
};
