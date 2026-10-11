# Mobitech

## Project Goal

A premium mobile-accessories e-commerce platform designed to offer high-quality device accessories, seamless customer browsing and WhatsApp-assisted checkout, and a streamlined administrative product and inventory management system.

## Tech Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, React Router, Axios, TanStack Query, Zustand, Lucide React, Zod
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, Zod, Helmet, CORS, Cookie-Parser, Dotenv
- **Tooling & Quality**: ESLint, Prettier, TypeScript Strict Mode, Vitest

## Planned Features

### Customer Side

- Premium homepage showcasing featured collections and categories
- Comprehensive shop page with category/product discovery
- Detailed product pages with specifications and imagery
- Product search, filtering, and sorting
- Shopping cart with persistent client-side state
- WhatsApp direct order integration
- Fast, responsive mobile-first user experience

### Admin Side

- Secure admin authentication
- Dashboard overview and analytics
- Complete product management (create, update, delete)
- Real-time inventory tracking and stock management
- Homepage content and banner controls

### Backend API

- Robust RESTful API architecture
- MongoDB integration with Mongoose ODM
- Authentication and authorization middleware
- Product, category, and inventory management endpoints
- Schema validation via Zod
- Centralized error handling and secure HTTP headers

## Development Phases

- Phase 0 — Foundation
- Phase 1 — Design System / UI Foundation
- Phase 2 — Homepage
- Phase 3 — Shop
- Phase 4 — Product Details + Cart
- Phase 5 — Backend Foundation
- Phase 6 — Authentication
- Phase 7 — Product + Inventory Management
- Phase 8 — Admin Panel
- Phase 9 — WhatsApp Ordering
- Phase 10 — Integration + QA

## Current Status

Phase 0 — Foundation

## Protected Requirements

### 1. Form Validation & Diagnostics
Field-level validation, visible input requirements, accurate backend error mapping, and actionable error notifications are core product requirements. Do not remove, bypass, weaken, or replace these features during future UI, form, API, backend, or refactoring work. Any change to validation behavior must preserve clear user feedback and must update relevant tests and documentation. Removal or material reduction requires explicit authorization from the project owner.

### 2. Image Upload, Auto-Compression & Storage Integrity
1. **Client-Side Optimization**: Product photos must be automatically optimized and compressed client-side before upload (maximum dimension $\le 2000$px on the longest edge, adaptive quality ~0.80–0.85, target 1–2MB, PNG transparency preserved, no enlargement of small images).
2. **Cloudinary as Storage Provider**: Cloudinary remains the exclusive image storage provider. Original assets are retained in Cloudinary while delivery is optimized via `f_auto,q_auto`.
3. **MongoDB Image Binary Ban**: MongoDB stores only image references/metadata (URLs, public IDs, dimensions), NEVER Base64 image data or raw binaries.
4. **Resilient Upload & Form Preservation**: Upload failures (network, missing configuration, oversized files) must preserve entered product data and selected images, never wipe form state, and display actionable diagnostics.
5. **Safe Environment Validation**: Server environment variables must be validated safely at startup without leaking secrets into logs, frontend bundles, or error responses.
6. **No Removal Without Authorization**: These architectural requirements must not be removed or altered without explicit owner authorization.