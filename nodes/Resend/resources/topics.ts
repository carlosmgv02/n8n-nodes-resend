import {
	INodeProperties,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { ResendResourceModule } from '../types';
import { buildIdField, buildPaginationFields } from '../utils/commonFields';
import { preparePaginatedRequest } from '../utils/requestBuilders';

// preSend hook for Create Topic
async function prepareCreateTopicRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: any = {
		name: this.getNodeParameter('name', '') as string,
		default_subscription: this.getNodeParameter('defaultSubscription', 'opt_in') as string,
	};

	const description = this.getNodeParameter('description', '') as string;
	if (description) {
		body.description = description;
	}

	const visibility = this.getNodeParameter('visibility', 'public') as string;
	if (visibility) {
		body.visibility = visibility;
	}

	// Validation
	if (!body.name) {
		throw new NodeOperationError(this.getNode(), 'Topic name is required');
	}

	requestOptions.body = body;
	return requestOptions;
}

// preSend hook for Update Topic
async function prepareUpdateTopicRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: any = {};

	const name = this.getNodeParameter('name', '') as string;
	if (name) {
		body.name = name;
	}

	const description = this.getNodeParameter('description', '') as string;
	if (description) {
		body.description = description;
	}

	const visibility = this.getNodeParameter('visibility', '') as string;
	if (visibility) {
		body.visibility = visibility;
	}

	requestOptions.body = body;
	return requestOptions;
}

export const topicsResource: ResendResourceModule = {
	description: {
		displayName: 'Topic',
		value: 'topics',
		description: 'Manage topics for email preferences',
	},

	operations: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new topic',
			action: 'Create a topic',
			routing: {
				request: {
					method: 'POST',
					url: '/topics',
				},
				send: {
					preSend: [prepareCreateTopicRequest],
				},
			},
		},
		{
			name: 'List',
			value: 'list',
			description: 'List all topics',
			action: 'List topics',
			routing: {
				request: {
					method: 'GET',
					url: '/topics',
				},
				send: {
					preSend: [preparePaginatedRequest],
				},
			},
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Get a topic by ID',
			action: 'Get a topic',
			routing: {
				request: {
					method: 'GET',
					url: '=/topics/{{$parameter.id}}',
				},
			},
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update a topic',
			action: 'Update a topic',
			routing: {
				request: {
					method: 'PATCH',
					url: '=/topics/{{$parameter.id}}',
				},
				send: {
					preSend: [prepareUpdateTopicRequest],
				},
			},
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a topic',
			action: 'Delete a topic',
			routing: {
				request: {
					method: 'DELETE',
					url: '=/topics/{{$parameter.id}}',
				},
			},
		},
	],

	fields: [
		// ================== CREATE TOPIC FIELDS ==================
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['topics'],
					operation: ['create', 'update'],
				},
			},
			description: 'Topic name (max 50 characters)',
			placeholder: 'Weekly Newsletter',
		},
		{
			displayName: 'Default Subscription',
			name: 'defaultSubscription',
			type: 'options',
			options: [
				{
					name: 'Opt-In',
					value: 'opt_in',
					description: 'Contacts are subscribed by default',
				},
				{
					name: 'Opt-Out',
					value: 'opt_out',
					description: 'Contacts must explicitly subscribe',
				},
			],
			default: 'opt_in',
			displayOptions: {
				show: {
					resource: ['topics'],
					operation: ['create'],
				},
			},
			description:
				'Default subscription preference for new contacts. Cannot be changed after creation.',
		},
		{
			displayName: 'Description',
			name: 'description',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					resource: ['topics'],
					operation: ['create', 'update'],
				},
			},
			description: 'Topic description (max 200 characters, optional)',
			placeholder: 'Subscribe to our weekly newsletter for updates',
		},
		{
			displayName: 'Visibility',
			name: 'visibility',
			type: 'options',
			options: [
				{
					name: 'Public',
					value: 'public',
					description: 'All contacts can see this topic on the unsubscribe page',
				},
				{
					name: 'Private',
					value: 'private',
					description: 'Only contacts opted-in can see this topic on the unsubscribe page',
				},
			],
			default: 'public',
			displayOptions: {
				show: {
					resource: ['topics'],
					operation: ['create', 'update'],
				},
			},
			description: 'Visibility of the topic on the unsubscribe page',
		},

		// ================== GET/UPDATE/DELETE TOPIC FIELDS ==================
		buildIdField('topics', ['get', 'update', 'delete'], 'Topic ID', 'The ID of the topic'),

		// ================== LIST TOPICS FIELDS ==================
		...buildPaginationFields('topics', 'list'),
	],
};
