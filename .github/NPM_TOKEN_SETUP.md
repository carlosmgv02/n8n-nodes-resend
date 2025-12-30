# NPM_TOKEN Setup Guide

This document explains how to configure the `NPM_TOKEN` secret required for automated npm publishing.

## Prerequisites

1. npm account at https://www.npmjs.com
2. Access to the npm package `n8n-nodes-api-resend` (package owner or collaborator)
3. Admin access to this GitHub repository

## Step 1: Create npm Access Token

1. Log in to https://www.npmjs.com
2. Click your profile icon → **Access Tokens**
3. Click **Generate New Token**
4. Select token type:
   - **Automation** (Recommended) - For CI/CD systems
   - Or **Publish** - If Automation is not available
5. Give it a descriptive name: `github-actions-n8n-nodes-api-resend`
6. Click **Generate Token**
7. **IMPORTANT:** Copy the token immediately - you won't see it again!

## Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/carlosmgv02/n8n-nodes-api-resend
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Fill in:
   - **Name:** `NPM_TOKEN`
   - **Secret:** Paste the token you copied from npm
5. Click **Add secret**

## Step 3: Verify Configuration

The secret is now configured! The next time you merge to `master` with a new version in `package.json`, the GitHub Action will:

1. ✅ Build the project
2. ✅ Check if the version is already published
3. ✅ If new → Publish to npm using your token
4. ✅ Create a GitHub release

## Testing the Setup

To test without actually publishing:

1. Create a test branch
2. Update `package.json` version to something like `1.0.0-test.1`
3. Push and create a PR
4. Merge to master
5. Watch the GitHub Actions logs

If everything is configured correctly, you'll see:
```
✓ Published to npm: n8n-nodes-api-resend@1.0.0-test.1
```

## Troubleshooting

### Error: "Unable to authenticate need: BASIC realm="Secured Package Area""

**Solution:** The `NPM_TOKEN` secret is missing or invalid.
- Verify the secret exists in GitHub Settings → Secrets
- Regenerate the token on npm and update the secret

### Error: "You do not have permission to publish"

**Solution:** Your npm account doesn't have publish rights to `n8n-nodes-api-resend`.
- Verify you're logged into the correct npm account
- Ask the package owner to add you as a collaborator
- Check the token has "Publish" permissions

### Error: "Cannot publish over existing version"

**Solution:** This version is already published to npm.
- This is expected behavior! The workflow skips publishing if the version exists
- To publish a new version, run: `npm version patch` (or minor/major)

## Security Best Practices

✅ **DO:**
- Use "Automation" token type (most secure)
- Rotate tokens periodically (every 6-12 months)
- Limit token to this specific package if possible

❌ **DON'T:**
- Share the token publicly
- Commit the token to the repository
- Use your personal login credentials

## Token Expiration

If your workflow suddenly fails with authentication errors:

1. Check if your npm token expired
2. Generate a new token (Step 1)
3. Update the GitHub secret (Step 2)

## Questions?

Contact the repository owner: [@carlosmgv02](https://github.com/carlosmgv02)
