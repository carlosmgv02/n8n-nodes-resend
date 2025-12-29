import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { Segment, Topic, Template, PaginatedResponse } from '../types';

/**
 * Load segments for dropdown selection
 */
export async function getSegments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'resendApi', {
			method: 'GET',
			url: 'https://api.resend.com/segments',
		})) as PaginatedResponse<Segment>;

		const segments = response.data || [];
		return segments.map((segment: Segment) => ({
			name: segment.name,
			value: segment.id,
			description: segment.description || undefined,
		}));
	} catch (error) {
		return [
			{
				name: 'Error loading segments',
				value: 'error',
			},
		];
	}
}

/**
 * Load topics for dropdown selection
 */
export async function getTopics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'resendApi', {
			method: 'GET',
			url: 'https://api.resend.com/topics',
		})) as PaginatedResponse<Topic>;

		const topics = response.data || [];
		return [
			{
				name: 'None (No topic)',
				value: '',
				description: 'Do not assign a topic to this email',
			},
			...topics.map((topic: Topic) => ({
				name: topic.name,
				value: topic.id,
				description: topic.description || `Default: ${topic.default_subscription}`,
			})),
		];
	} catch (error) {
		return [
			{
				name: 'Error loading topics',
				value: 'error',
			},
		];
	}
}

/**
 * Load templates for dropdown selection
 */
export async function getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'resendApi', {
			method: 'GET',
			url: 'https://api.resend.com/templates',
		})) as PaginatedResponse<Template>;

		const templates = response.data || [];
		// Only show published templates
		const publishedTemplates = templates.filter(
			(template: Template) => template.status === 'published',
		);

		return publishedTemplates.map((template: Template) => ({
			name: template.name,
			value: template.id,
			description: template.alias ? `Alias: ${template.alias}` : undefined,
		}));
	} catch (error) {
		return [
			{
				name: 'Error loading templates',
				value: 'error',
			},
		];
	}
}

/**
 * Load template variables for dynamic field generation
 */
export async function getTemplateVariables(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const templateId = this.getNodeParameter('templateId') as string;

		if (!templateId || templateId === '') {
			return [];
		}

		const template = (await this.helpers.httpRequestWithAuthentication.call(this, 'resendApi', {
			method: 'GET',
			url: `https://api.resend.com/templates/${templateId}`,
		})) as Template;

		if (!template.variables || template.variables.length === 0) {
			return [
				{
					name: 'No variables defined in this template',
					value: '__no_variables__',
				},
			];
		}

		return template.variables.map((variable) => ({
			name: `${variable.key}${
				variable.fallback_value ? ` (default: ${variable.fallback_value})` : ''
			}`,
			value: variable.key,
			description: `Type: ${variable.type}`,
		}));
	} catch (error) {
		return [
			{
				name: 'Error loading template variables',
				value: 'error',
			},
		];
	}
}
