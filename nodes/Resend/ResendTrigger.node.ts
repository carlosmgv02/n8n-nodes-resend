import {
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

/**
 * Verify Svix webhook signature using Web Crypto API
 * Resend uses Svix for webhook signing
 */
async function verifySvixSignature(
	payload: string,
	svixId: string,
	svixTimestamp: string,
	svixSignature: string,
	webhookSigningSecret: string,
): Promise<void> {
	const secret = webhookSigningSecret.replace(/^whsec_/, '');
	const secretBytes = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));

	const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;
	const payloadBytes = new TextEncoder().encode(signedPayload);

	const key = await globalThis.crypto.subtle.importKey(
		'raw',
		secretBytes,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);

	const signatureBuffer = await globalThis.crypto.subtle.sign('HMAC', key, payloadBytes);
	const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

	const signatures = svixSignature.split(' ');

	for (const sig of signatures) {
		const [version, signature] = sig.split(',');
		if (version === 'v1' && signature === expectedSignature) {
			return;
		}
	}

	throw new NodeOperationError(
		{} as any,
		'Invalid webhook signature - ensure your signing secret is correct',
	);
}

export class ResendTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Resend Trigger',
		name: 'resendTrigger',
		icon: 'file:resend.svg',
		group: ['trigger'],
		version: 1,
		description:
			'Trigger workflows on Resend webhook events (email sent, delivered, opened, clicked, bounced, etc.)',
		subtitle: '={{$parameter["events"].join(", ")}}',
		defaults: {
			name: 'Resend Trigger',
		},
		triggerPanel: {
			header: 'Copy the webhook URL below and configure it in your Resend dashboard',
			executionsHelp: {
				inactive:
					'Webhooks have two modes: test and production.<br><br><b>Test mode:</b> Click "Listen for test event", then configure the test URL in Resend. Executions appear in the editor.<br><br><b>Production mode:</b> Activate the workflow, then configure the production URL in Resend. Executions appear in the executions list.',
				active:
					'Webhooks have two modes: test and production.<br><br><b>Test mode:</b> Click "Listen for test event", then configure the test URL in Resend. Executions appear in the editor.<br><br><b>Production mode:</b> The workflow is active. Configure the production URL in Resend. Executions appear in the executions list.',
			},
			activationHint: 'Activate the workflow to use the production webhook URL in Resend.',
		},
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Webhook Signing Secret',
				name: 'webhookSigningSecret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				placeholder: 'whsec_...',
				description:
					'Webhook signing secret from your Resend webhook configuration. Required for security.',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['email.sent'],
				options: [
					{
						name: 'Email Sent',
						value: 'email.sent',
						description: 'Triggered when an email is successfully sent',
					},
					{
						name: 'Email Delivered',
						value: 'email.delivered',
						description: 'Triggered when an email is delivered to the recipient',
					},
					{
						name: 'Email Delivery Delayed',
						value: 'email.delivery_delayed',
						description: 'Triggered when email delivery is delayed',
					},
					{
						name: 'Email Bounced',
						value: 'email.bounced',
						description: 'Triggered when an email bounces',
					},
					{
						name: 'Email Opened',
						value: 'email.opened',
						description: 'Triggered when a recipient opens an email',
					},
					{
						name: 'Email Clicked',
						value: 'email.clicked',
						description: 'Triggered when a recipient clicks a link in an email',
					},
					{
						name: 'Email Complained',
						value: 'email.complained',
						description: 'Triggered when a recipient marks an email as spam',
					},
					{
						name: 'Contact Created',
						value: 'contact.created',
						description: 'Triggered when a new contact is created',
					},
					{
						name: 'Contact Updated',
						value: 'contact.updated',
						description: 'Triggered when a contact is updated',
					},
					{
						name: 'Contact Deleted',
						value: 'contact.deleted',
						description: 'Triggered when a contact is deleted',
					},
					{
						name: 'Domain Created',
						value: 'domain.created',
						description: 'Triggered when a new domain is created',
					},
					{
						name: 'Domain Updated',
						value: 'domain.updated',
						description: 'Triggered when a domain is updated',
					},
					{
						name: 'Domain Deleted',
						value: 'domain.deleted',
						description: 'Triggered when a domain is deleted',
					},
				],
				description: 'Select the Resend events to listen for. Multiple events can be selected.',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const headers = this.getHeaderData();
		const subscribedEvents = this.getNodeParameter('events') as string[];
		const webhookSigningSecret = this.getNodeParameter('webhookSigningSecret') as string;

		if (webhookSigningSecret && webhookSigningSecret.trim() !== '') {
			try {
				const payload = JSON.stringify(bodyData);

				const svixId =
					(Array.isArray(headers['svix-id']) ? headers['svix-id'][0] : headers['svix-id']) ||
					(Array.isArray(headers['Svix-Id']) ? headers['Svix-Id'][0] : headers['Svix-Id']) ||
					'';
				const svixTimestamp =
					(Array.isArray(headers['svix-timestamp'])
						? headers['svix-timestamp'][0]
						: headers['svix-timestamp']) ||
					(Array.isArray(headers['Svix-Timestamp'])
						? headers['Svix-Timestamp'][0]
						: headers['Svix-Timestamp']) ||
					'';
				const svixSignature =
					(Array.isArray(headers['svix-signature'])
						? headers['svix-signature'][0]
						: headers['svix-signature']) ||
					(Array.isArray(headers['Svix-Signature'])
						? headers['Svix-Signature'][0]
						: headers['Svix-Signature']) ||
					'';

				if (!svixId || !svixTimestamp || !svixSignature) {
					throw new NodeOperationError(
						this.getNode(),
						'Missing required Svix headers for webhook verification',
					);
				}

				await verifySvixSignature(
					payload,
					svixId,
					svixTimestamp,
					svixSignature,
					webhookSigningSecret,
				);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Webhook signature verification failed: ${error.message}`,
				);
			}
		}

		if (!bodyData || typeof bodyData !== 'object' || !('type' in bodyData)) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid webhook payload - expected JSON object with "type" field',
			);
		}

		const eventType = (bodyData as { type: string }).type;

		if (!subscribedEvents.includes(eventType)) {
			return {
				workflowData: [[]],
			};
		}

		return {
			workflowData: [this.helpers.returnJsonArray([bodyData])],
		};
	}

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};
}
