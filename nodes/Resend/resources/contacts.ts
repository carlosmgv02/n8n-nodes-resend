import {
	INodeProperties,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';
import { ResendResourceModule } from '../types';
import { buildContactPropertiesField } from '../utils/fieldBuilders';
import { buildIdField, buildPaginationFields } from '../utils/commonFields';
import { processContactProperties } from '../utils/templateHelpers';
import { preparePaginatedRequest } from '../utils/requestBuilders';

// preSend hook for Create Contact
async function prepareCreateContactRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: any = {
		email: this.getNodeParameter('email', '') as string,
	};

	const firstName = this.getNodeParameter('firstName', '') as string;
	if (firstName) {
		body.first_name = firstName;
	}

	const lastName = this.getNodeParameter('lastName', '') as string;
	if (lastName) {
		body.last_name = lastName;
	}

	const unsubscribed = this.getNodeParameter('unsubscribed', false) as boolean;
	body.unsubscribed = unsubscribed;

	// Custom properties
	const propertiesData = this.getNodeParameter('properties', {}) as any;
	const properties = processContactProperties(propertiesData);
	if (properties) {
		body.properties = properties;
	}

	// Validation
	if (!body.email) {
		throw new NodeOperationError(this.getNode(), 'Email is required');
	}

	requestOptions.body = body;
	return requestOptions;
}

// preSend hook for Update Contact
async function prepareUpdateContactRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: any = {};

	const firstName = this.getNodeParameter('firstName', '') as string;
	if (firstName) {
		body.first_name = firstName;
	}

	const lastName = this.getNodeParameter('lastName', '') as string;
	if (lastName) {
		body.last_name = lastName;
	}

	const unsubscribed = this.getNodeParameter('unsubscribed', false) as boolean;
	body.unsubscribed = unsubscribed;

	// Custom properties
	const propertiesData = this.getNodeParameter('properties', {}) as any;
	const properties = processContactProperties(propertiesData);
	if (properties) {
		body.properties = properties;
	}

	requestOptions.body = body;
	return requestOptions;
}

export const contactsResource: ResendResourceModule = {
	description: {
		displayName: 'Contact',
		value: 'contacts',
		description: 'Manage contacts and audiences',
	},

	operations: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new contact',
			action: 'Create a contact',
			routing: {
				request: {
					method: 'POST',
					url: '/contacts',
				},
				send: {
					preSend: [prepareCreateContactRequest],
				},
			},
		},
		{
			name: 'List',
			value: 'list',
			description: 'List all contacts',
			action: 'List contacts',
			routing: {
				request: {
					method: 'GET',
					url: '/contacts',
				},
				send: {
					preSend: [preparePaginatedRequest],
				},
			},
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Get a contact by ID or email',
			action: 'Get a contact',
			routing: {
				request: {
					method: 'GET',
					url: '=/contacts/{{$parameter.contactIdOrEmail}}',
				},
			},
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update a contact',
			action: 'Update a contact',
			routing: {
				request: {
					method: 'PATCH',
					url: '=/contacts/{{$parameter.contactIdOrEmail}}',
				},
				send: {
					preSend: [prepareUpdateContactRequest],
				},
			},
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a contact',
			action: 'Delete a contact',
			routing: {
				request: {
					method: 'DELETE',
					url: '=/contacts/{{$parameter.contactIdOrEmail}}',
				},
			},
		},
		{
			name: 'Add to Segment',
			value: 'addToSegment',
			description: 'Add a contact to a segment',
			action: 'Add contact to segment',
			routing: {
				request: {
					method: 'POST',
					url: '=/contacts/{{$parameter.contactId}}/segments/{{$parameter.segmentId}}',
				},
			},
		},
		{
			name: 'Remove from Segment',
			value: 'removeFromSegment',
			description: 'Remove a contact from a segment',
			action: 'Remove contact from segment',
			routing: {
				request: {
					method: 'DELETE',
					url: '=/contacts/{{$parameter.contactId}}/segments/{{$parameter.segmentId}}',
				},
			},
		},
	],

	fields: [
		// ================== CREATE CONTACT FIELDS ==================
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['create'],
				},
			},
			description: 'Contact email address',
			placeholder: 'user@example.com',
		},
		{
			displayName: 'First Name',
			name: 'firstName',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Contact first name',
		},
		{
			displayName: 'Last Name',
			name: 'lastName',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Contact last name',
		},
		{
			displayName: 'Unsubscribed',
			name: 'unsubscribed',
			type: 'boolean',
			default: false,
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['create', 'update'],
				},
			},
			description: 'Whether the contact is unsubscribed from all broadcasts',
		},
		buildContactPropertiesField('contacts', ['create', 'update']),

		// ================== GET/UPDATE/DELETE CONTACT FIELDS ==================
		{
			displayName: 'Contact ID or Email',
			name: 'contactIdOrEmail',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['get', 'update', 'delete'],
				},
			},
			description: 'The ID or email address of the contact',
			placeholder: 'contact-id or user@example.com',
		},

		// ================== ADD/REMOVE SEGMENT FIELDS ==================
		{
			displayName: 'Contact ID',
			name: 'contactId',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['addToSegment', 'removeFromSegment'],
				},
			},
			description: 'The ID of the contact',
		},
		{
			displayName: 'Segment',
			name: 'segmentId',
			type: 'string',
			typeOptions: {
				loadOptionsMethod: 'getSegments',
			},
			required: true,
			default: '',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['addToSegment', 'removeFromSegment'],
				},
			},
			description: 'The segment to add/remove the contact to/from. Choose from the dropdown or use an expression.',
			hint: 'Toggle to "Expression" to use a segment ID from a previous node',
		},

		// ================== LIST CONTACTS FIELDS ==================
		...buildPaginationFields('contacts', 'list'),
	],
};
