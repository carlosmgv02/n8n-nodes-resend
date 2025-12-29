# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-29

### Added
- **Resend Trigger Node** - React to webhook events from Resend
  - Email events: sent, delivered, opened, clicked, bounced, complained, delivery_delayed
  - Contact events: created, updated, deleted
  - Domain events: created, updated, deleted
  - Secure webhook signature verification using Svix
  - Configurable event filtering
- Complete Resend API integration for n8n
- Support for 6 resources: Email, Broadcast, Contact, Segment, Topic, Template
- 31 operations across all resources
- Email operations: send, sendBatch, list, get, cancel, update
- Contact management with custom properties
- Broadcast campaigns to segments
- Template support with variable injection
- Attachment handling with base64 encoding and CID support
- Email scheduling capabilities
- Pagination support across all list operations
- Dynamic dropdowns for segments, topics, and templates

### Changed
- Major refactoring to eliminate code duplication (138 lines removed)
- Centralized constants for better maintainability
- Improved TypeScript type safety with dedicated interfaces
- All comments translated to English for consistency
- Reduced file sizes by extracting shared utilities

### Technical Improvements
- Created `constants.ts` for centralized configuration
- Created `utils/requestBuilders.ts` for shared request functions
- Extracted `preparePaginatedRequest` to single source of truth
- Added proper TypeScript interfaces for request bodies
- Improved code organization and maintainability
- Added ESLint configuration
- Set up CI/CD pipeline with GitHub Actions

### Infrastructure
- Automated CI checks on pull requests
- Automated npm publishing on master merge
- Quality checks for code duplication
- Verification of language consistency
- Build validation across Node 18.x and 20.x

## [Unreleased]

### Planned
- Add unit tests
- Add integration tests with Resend API
- Expand documentation with examples
- Add more detailed error messages

---

## Version Guidelines

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New features (backward compatible)
- **PATCH** version (0.0.X): Bug fixes (backward compatible)

## Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-resend)
- [GitHub repository](https://github.com/carlosmgv02/n8n-nodes-resend)
- [Issue tracker](https://github.com/carlosmgv02/n8n-nodes-resend/issues)
