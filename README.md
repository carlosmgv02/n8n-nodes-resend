<div align="center">
  <img src="https://raw.githubusercontent.com/carlosmgv02/n8n-nodes-resend/master/nodes/Resend/resend.png" alt="Resend Logo" width="120" height="120">

  # n8n-nodes-resend

  **Modern Email API Integration for n8n**

  [![npm version](https://img.shields.io/npm/v/n8n-resend.svg)](https://www.npmjs.com/package/n8n-resend)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![CI](https://github.com/carlosmgv02/n8n-nodes-resend/actions/workflows/ci.yml/badge.svg)](https://github.com/carlosmgv02/n8n-nodes-resend/actions/workflows/ci.yml)

  [Installation](#installation) • [Features](#key-features) • [Usage](#usage-examples) • [Contributing](CONTRIBUTING.md)
</div>

---

This is an n8n community node for [Resend](https://resend.com) - a modern email API for developers. It lets you send transactional emails, manage contacts and segments, and send marketing broadcasts directly from your n8n workflows.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter `n8n-resend` in the npm Package Name field
4. Click **Install**

### Manual Installation

```bash
npm install n8n-resend
```

## Configuration

1. Get your API key from [Resend Dashboard](https://resend.com/api-keys)
2. In n8n, create new Resend API credentials
3. Paste your API key

## Nodes Included

This package includes two nodes:

1. **Resend** - Main node for sending emails, managing contacts, segments, broadcasts, topics, and templates
2. **Resend Trigger** - Webhook trigger to react to Resend events in real-time

## Resources & Operations

### Resend Node

#### Email
- **Send** - Send a transactional email with attachments, templates, headers, and tags
- **Send Batch** - Send up to 100 emails in a single request
- **List** - List all sent emails with pagination
- **Get** - Retrieve a specific email by ID
- **Cancel** - Cancel a scheduled email
- **Update** - Update a scheduled email

### Contact
- **Create** - Create a new contact with custom properties
- **List** - List all contacts with pagination
- **Get** - Get a contact by ID or email
- **Update** - Update contact information
- **Delete** - Delete a contact
- **Add to Segment** - Assign a contact to a segment
- **Remove from Segment** - Remove a contact from a segment

### Segment
- **Create** - Create a new segment for organizing contacts
- **List** - List all segments
- **Get** - Get a specific segment
- **Update** - Update segment details
- **Delete** - Delete a segment

### Broadcast
- **Create** - Create a new broadcast email campaign
- **List** - List all broadcasts
- **Get** - Get a specific broadcast
- **Update** - Update broadcast content
- **Send** - Send a broadcast immediately or schedule for later
- **Delete** - Delete a broadcast (draft only)

### Topic
- **Create** - Create a new topic for email preferences
- **List** - List all topics
- **Get** - Get a specific topic
- **Update** - Update topic details
- **Delete** - Delete a topic

#### Template
- **List** - List all email templates
- **Get** - Get a specific template by ID or alias

### Resend Trigger Node

The Resend Trigger node allows you to react to events from Resend in real-time using webhooks.

#### Supported Events

**Email Events:**
- **Email Sent** - When an email is successfully sent
- **Email Delivered** - When an email is delivered to the recipient
- **Email Delivery Delayed** - When email delivery is delayed
- **Email Opened** - When a recipient opens an email
- **Email Clicked** - When a recipient clicks a link in an email
- **Email Bounced** - When an email bounces
- **Email Complained** - When a recipient marks an email as spam

**Contact Events:**
- **Contact Created** - When a new contact is created
- **Contact Updated** - When a contact is updated
- **Contact Deleted** - When a contact is deleted

**Domain Events:**
- **Domain Created** - When a new domain is created
- **Domain Updated** - When a domain is updated
- **Domain Deleted** - When a domain is deleted

#### Setup

1. Add the Resend Trigger node to your workflow
2. Copy the webhook URL from the node
3. Go to your [Resend Webhooks settings](https://resend.com/webhooks)
4. Create a new webhook and paste the URL
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)
6. Paste the signing secret in the node configuration
7. Select the events you want to listen for
8. Activate your workflow

#### Security

The trigger automatically verifies webhook signatures using Svix to ensure requests come from Resend. This prevents unauthorized webhook calls.

## Key Features

### Dynamic Dropdowns
The node provides smart dropdowns that automatically load:
- **Segments** - Select from your existing segments
- **Domains** - Choose from verified domains
- **Topics** - Pick topics for preference management
- **Templates** - Use your saved email templates

### Email Attachments
Full support for email attachments:
- Binary data from previous nodes
- Inline images with Content-ID (CID) for embedding in HTML
- Multiple attachments per email
- Automatic base64 encoding
- Size validation (40MB limit)

### Template Variables
Dynamic template variable injection:
- Key-value pairs for template variables
- Automatic type detection (string/number)
- Support for Resend's variable syntax `{{{VARIABLE_NAME}}}`

### Custom Headers & Tags
- Add custom email headers for advanced use cases
- Tag emails for tracking and categorization
- Support for List-Unsubscribe headers

### Scheduling
Schedule emails and broadcasts:
- Natural language: "in 1 hour", "tomorrow at 9am"
- ISO 8601 format: "2024-12-25T09:00:00Z"

## Usage Examples

### Send a Simple Email
1. Add Resend node to your workflow
2. Select **Email** resource
3. Select **Send** operation
4. Fill in From, To, Subject, and HTML fields

### Send Email with Template
1. Select **Email** > **Send**
2. Enable **Use Template**
3. Select your template from the dropdown
4. Add template variables as needed

### Send Email with Attachments
1. Use HTTP Request or Read Binary File node before Resend
2. In Resend node: **Email** > **Send**
3. Add **Attachments**
4. Set **Binary Property** to the name of your binary data (e.g., "data")
5. Optionally set filename and Content-ID for inline images

### Create and Send a Broadcast
1. **Segment** > **Create** - Create your audience segment
2. **Contact** > **Create** - Add contacts to your list
3. **Contact** > **Add to Segment** - Assign contacts to the segment
4. **Broadcast** > **Create** - Create your broadcast email
5. **Broadcast** > **Send** - Send to your segment

### Manage Contact Preferences with Topics
1. **Topic** > **Create** - Create topics (e.g., "Newsletter", "Product Updates")
2. **Email** > **Send** - Include `topicId` when sending
3. Contacts can manage their preferences via unsubscribe page

### React to Email Events with Trigger
1. **Resend Trigger** - Configure webhook to listen for "Email Opened" events
2. **IF Node** - Check if email was opened more than once
3. **Resend** > **Contact** > **Update** - Tag contact as "highly engaged"
4. Automatically segment your most engaged subscribers

## API Limits

- **Attachments**: Maximum 40MB total per email
- **Batch Emails**: Up to 100 emails per batch request
- **Rate Limits**: Varies by Resend plan

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:
- Development setup
- Code standards
- Pull request process
- Release workflow

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Watch mode
npm run dev
```

## Support

For bugs and feature requests, please [create an issue](https://github.com/carlosmgv02/n8n-nodes-resend/issues).

## Compatibility

This node has been tested with n8n version 1.0.0 and above.
