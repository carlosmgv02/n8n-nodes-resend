import { IExecuteSingleFunctions, NodeOperationError } from 'n8n-workflow';
import { ResendAttachment } from '../types';
import { ATTACHMENT } from '../constants';

/**
 * Process attachments from fixedCollection format to Resend API format
 */
export async function processAttachments(
	this: IExecuteSingleFunctions,
	attachmentsData: any,
): Promise<ResendAttachment[]> {
	if (!attachmentsData?.attachment?.length) {
		return [];
	}

	const attachments: ResendAttachment[] = [];
	let totalSize = 0;
	const MAX_SIZE = ATTACHMENT.MAX_SIZE_BYTES;

	for (const attachment of attachmentsData.attachment) {
		const processedAttachment: ResendAttachment = {};

		// Handle binary property
		if (attachment.binaryPropertyName) {
			try {
				const binaryData = this.getInputData().binary?.[attachment.binaryPropertyName];

				if (binaryData) {
					// Convert binary data to base64
					const buffer = await this.helpers.getBinaryDataBuffer(attachment.binaryPropertyName);
					processedAttachment.content = buffer.toString('base64');
					totalSize += buffer.length;

					// Set filename
					processedAttachment.filename = attachment.filename || binaryData.fileName || 'file';

					// Set content type
					if (attachment.contentType) {
						processedAttachment.content_type = attachment.contentType;
					} else if (binaryData.mimeType) {
						processedAttachment.content_type = binaryData.mimeType;
					}
				}
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Error reading binary data from property "${attachment.binaryPropertyName}": ${error.message}`,
				);
			}
		}

		// Handle inline images (CID)
		if (attachment.contentId) {
			processedAttachment.content_id = attachment.contentId;
		}

		// Add filename if provided and not already set
		if (attachment.filename && !processedAttachment.filename) {
			processedAttachment.filename = attachment.filename;
		}

		// Only add if we have content
		if (processedAttachment.content) {
			// Validate total size
			if (totalSize > MAX_SIZE) {
				throw new NodeOperationError(
					this.getNode(),
					`Total attachment size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds the ${
						ATTACHMENT.MAX_SIZE_MB
					}MB limit`,
				);
			}

			attachments.push(processedAttachment);
		}
	}

	return attachments;
}

/**
 * Split email string into array of email addresses
 */
export function splitEmails(emailString: string): string[] {
	if (!emailString || emailString.trim() === '') {
		return [];
	}

	return emailString
		.split(',')
		.map((email) => email.trim())
		.filter((email) => email.length > 0);
}

/**
 * Convert fixedCollection key-value pairs to object
 */
export function keyValuePairsToObject(
	data: any,
	itemName: string = 'pair',
): Record<string, string> | undefined {
	if (!data?.[itemName]?.length) {
		return undefined;
	}

	const result: Record<string, string> = {};
	for (const item of data[itemName]) {
		if (item.key && item.value !== undefined) {
			result[item.key] = item.value;
		}
	}

	return Object.keys(result).length > 0 ? result : undefined;
}
