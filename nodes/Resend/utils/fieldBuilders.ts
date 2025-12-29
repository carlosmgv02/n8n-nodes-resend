import { INodeProperties } from 'n8n-workflow';
import { ResendResource } from '../types';

export function buildAttachmentField(
	resource: ResendResource,
	operations: string[],
): INodeProperties {
	return {
		displayName: 'Attachments',
		name: 'attachments',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		options: [
			{
				name: 'attachment',
				displayName: 'Attachment',
				values: [
					{
						displayName: 'Binary Property',
						name: 'binaryPropertyName',
						type: 'string',
						default: 'data',
						description: 'Name of the binary property containing the attachment data',
						placeholder: 'data',
					},
					{
						displayName: 'Filename',
						name: 'filename',
						type: 'string',
						default: '',
						description: 'Name of the file (optional if using binary property)',
					},
					{
						displayName: 'Content Type',
						name: 'contentType',
						type: 'string',
						default: '',
						placeholder: 'image/png',
						description: 'MIME type of the attachment (optional)',
					},
					{
						displayName: 'Content ID (CID)',
						name: 'contentId',
						type: 'string',
						default: '',
						placeholder: 'logo-image',
						description:
							'For inline images - reference in HTML as &lt;img src="cid:logo-image"&gt;',
					},
				],
			},
		],
		description: 'Attachments to include in the email',
	};
}

export function buildTemplateVariablesField(
	resource: ResendResource,
	operations: string[],
): INodeProperties {
	return {
		displayName: 'Template Variables',
		name: 'templateVariables',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
				useTemplate: [true],
			},
		},
		options: [
			{
				name: 'variable',
				displayName: 'Variable',
				values: [
					{
						displayName: 'Variable Name',
						name: 'key',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getTemplateVariables',
							loadOptionsDependsOn: ['templateId'],
						},
						default: '',
						description: 'Select a variable from the template',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Variable value (numbers will be auto-detected)',
					},
				],
			},
		],
		description: 'Variables to inject into the template',
	};
}

export function buildKeyValuePairField(
	displayName: string,
	name: string,
	resource: ResendResource,
	operations: string[],
	description: string,
	itemName: string = 'pair',
): INodeProperties {
	return {
		displayName,
		name,
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		options: [
			{
				name: itemName,
				displayName: 'Item',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'The key name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value',
					},
				],
			},
		],
		description,
	};
}

export function buildContactPropertiesField(
	resource: ResendResource,
	operations: string[],
): INodeProperties {
	return {
		displayName: 'Custom Properties',
		name: 'properties',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		options: [
			{
				name: 'property',
				displayName: 'Property',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'Property key name',
						placeholder: 'company_name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Property value',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'String',
								value: 'string',
							},
							{
								name: 'Number',
								value: 'number',
							},
						],
						default: 'string',
						description: 'Data type of the property value',
					},
				],
			},
		],
		description: 'Custom properties for the contact',
	};
}

export function buildEmailArrayField(
	displayName: string,
	name: string,
	resource: ResendResource,
	operations: string[],
	required: boolean = false,
	description: string = 'Comma-separated list of email addresses',
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		required,
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		description,
		placeholder: 'user@example.com, another@example.com',
	};
}
