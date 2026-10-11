# Validation and Error Handling Architecture

## Overview
Mobitech implements a robust, permanent validation and error-reporting system designed to ensure data integrity and provide clear, actionable feedback to users (especially store administrators). This document outlines the authoritative rules, error handling mechanisms, and protected requirements.

## 1. Authoritative Validation Schemas
The single source of truth for validation limits is located in:
- `server/src/validators/product.validator.ts`
- `client/src/validators/product.validator.ts`

These schemas use **Zod** for runtime type checking and validation.
Current Product constraints:
- `name`: 3 to 100 characters.
- `slug`: 3 to 100 characters.
- `description`: 10 to 3000 characters.
- `price`: strictly positive (0.01 to 1,000,000).
- `stockQuantity`: non-negative integer (0 to 100,000).
- `category`: Must be a valid ObjectId.
- `images`: Adheres to Cloudinary constraints (file size, format).

These limits are also mirrored in Mongoose schemas (e.g., `server/src/models/Product.ts`).

## 2. Field-Level Error Behavior
- Forms (e.g., `AdminProductForm`) MUST display validation requirements (min/max lengths, expected formats) *before* the user submits the form.
- Character counters should be used where practical.
- Failed validations display inline, human-readable errors immediately beneath the offending field.
- The UI leverages `aria-invalid` and `aria-describedby` for accessibility.
- The first invalid field should receive focus upon a failed submission.

## 3. Toast Notifications
- A non-blocking toast (via the custom `Toast` component) is used to display a concise summary of the failure (e.g., "Product not saved — Check field errors below.").
- Toasts automatically dismiss, but provide a close button for immediate dismissal.
- Sensitive information, stack traces, and internal database details are NEVER exposed in toasts.

## 4. Backend Error Mapping
The frontend is responsible for intelligently parsing backend API errors:
- If a 400 Bad Request contains structured Zod/Mongoose validation errors, the frontend maps these errors directly to the corresponding form fields (e.g., a `price` error from the backend highlights the "Selling Price" field).
- Duplicate key errors (e.g., `slug` already exists) are mapped to the appropriate field with a friendly message.
- If an error cannot be mapped to a specific field, a generic but informative toast is displayed.

## 5. Protected Requirements
**DO NOT REMOVE, BYPASS, WEAKEN, OR REPLACE** the field-level validation, visible input requirements, accurate backend error mapping, and actionable error notifications during future UI, form, API, backend, or refactoring work. Any change to validation behavior must preserve clear user feedback and must update relevant tests and documentation. Removal or material reduction requires explicit authorization from the project owner.
