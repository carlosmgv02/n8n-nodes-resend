import { IExecuteSingleFunctions, IHttpRequestOptions, IDataObject } from 'n8n-workflow';
import { PAGINATION } from '../constants';
import { processTemplateVariables } from './templateHelpers';

/**
 * Shared preSend hook for pagination across all resources
 */
export async function preparePaginatedRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const qs: IDataObject = {};

	const limit = this.getNodeParameter('limit', PAGINATION.DEFAULT_LIMIT) as number;
	qs.limit = limit;

	const after = this.getNodeParameter('after', '') as string;
	if (after) {
		qs.after = after;
	}

	const before = this.getNodeParameter('before', '') as string;
	if (before) {
		qs.before = before;
	}

	requestOptions.qs = qs;
	return requestOptions;
}

/**
 * Process template or HTML content for emails and broadcasts
 * @param context - The n8n execution context
 * @param includeSubject - Whether to include subject field when not using template
 * @returns Object with template or html/text/subject fields
 */
export function processTemplateOrHtmlContent(
	context: IExecuteSingleFunctions,
	includeSubject: boolean = false,
): { template?: any; html?: string; text?: string; subject?: string } {
	const result: any = {};

	const useTemplate = context.getNodeParameter('useTemplate', false) as boolean;

	if (useTemplate) {
		const templateId = context.getNodeParameter('templateId', '') as string;
		const templateVariables = context.getNodeParameter('templateVariables', {}) as any;

		result.template = {
			id: templateId,
			variables: processTemplateVariables(templateVariables),
		};
	} else {
		if (includeSubject) {
			result.subject = context.getNodeParameter('subject', '') as string;
		}
		result.html = context.getNodeParameter('html', '') as string;

		const text = context.getNodeParameter('text', '') as string;
		if (text) {
			result.text = text;
		}
	}

	return result;
}
