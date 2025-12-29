import { INodeProperties } from 'n8n-workflow';
import { ResendResource } from '../types';
import { PAGINATION } from '../constants';

export function buildResourceField(
	resources: { name: string; value: ResendResource }[],
): INodeProperties {
	return {
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: resources,
		default: 'emails',
		description: 'The resource to operate on',
	};
}

export function buildIdField(
	resource: ResendResource,
	operations: string[],
	displayName: string = 'ID',
	description: string = 'The ID of the resource',
): INodeProperties {
	return {
		displayName,
		name: 'id',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		description,
	};
}

export function buildPaginationFields(
	resource: ResendResource,
	operation: string,
): INodeProperties[] {
	return [
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: PAGINATION.DEFAULT_LIMIT,
			typeOptions: {
				minValue: 1,
				maxValue: PAGINATION.MAX_LIMIT,
			},
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			description: `Maximum number of results to return (1-${PAGINATION.MAX_LIMIT})`,
		},
		{
			displayName: 'After',
			name: 'after',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			description: 'Cursor for forward pagination (ID of last item from previous page)',
		},
		{
			displayName: 'Before',
			name: 'before',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			description: 'Cursor for backward pagination (ID of first item from next page)',
		},
	];
}
