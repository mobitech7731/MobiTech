# Mobitech — Image Upload, Auto-Compression & Storage Architecture

## 1. Overview & Upload Pipeline

Mobitech product imagery follows a resilient, high-performance image pipeline designed to optimize store visitor bandwidth, enforce storage security, and prevent unhelpful upload failures.

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                       |
|                                                                                         |
|  1. Drag & Drop / File Browser Selection (JPG, PNG, WEBP)                               |
|     |                                                                                   |
|  2. Client-Side Validation (validateImageFileType, max 5 photos, max 20MB raw)          |
|     |                                                                                   |
|  3. Client-Side Adaptive Optimization (optimizeImage)                                   |
|     - Max 2000px longest edge (downscale oversized, never upscale small photos)         |
|     - Preserve PNG alpha transparency (no black/white background conversion)             |
|     - Adaptive quality loop (0.85 -> 0.72) targeting ~1-2MB                             |
|     - Skips recompression if already optimal                                            |
|     |                                                                                   |
|  4. Form Data Dispatch (uploadService.uploadImage via multipart/form-data)              |
+-----------------------------------------------------------------------------------------+
                                           | HTTP POST /api/upload/image (Bearer JWT)
                                           v
+-----------------------------------------------------------------------------------------+
|                                    EXPRESS BACKEND                                      |
|                                                                                         |
|  5. Authentication Guard (authMiddleware) -> 401 if unauthenticated                     |
|     |                                                                                   |
|  6. Multer Memory Storage Engine (limits: 5MB, memoryStorage)                           |
|     - Oversized file -> 413 Payload Too Large                                           |
|     - Unsupported MIME -> 415 Unsupported Media Type                                    |
|     |                                                                                   |
|  7. Environment & Storage Pre-check (cloudinaryService.isConfigured)                     |
|     - Missing Cloudinary variables -> 503 Service Unavailable with diagnostic details    |
|     |                                                                                   |
|  8. Magic Byte Sniffing (isValidImageBuffer)                                            |
|     - Validates actual file signature (FF D8 FF, 89 50 4E 47, RIFF...WEBP)              |
|     - Rejects disguised text/binary files -> 400 Bad Request                            |
|     |                                                                                   |
|  9. Cloudinary Upload Stream (folder: mobitech/products)                                |
|     - Maps provider errors: Auth -> 502, RateLimit -> 429, Timeout -> 504               |
|     - Generates delivery-optimized URL (f_auto, q_auto)                                 |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                                  CLOUDINARY STORAGE                                     |
|                                                                                         |
|  - Stores original photo safely in 'mobitech/products'                                  |
|  - Serves responsive, dynamic format & quality via CDN transforms (f_auto, q_auto)       |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                                     MONGODB STORAGE                                     |
|                                                                                         |
|  - Product document stores ONLY URL references & metadata:                              |
|    { url, publicId, width, height, format, bytes }                                      |
|  - Base64 data URIs ('data:image/...') are strictly banned by Zod schema               |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Environment Files & Runtime Loading Architecture

The project maintains clearly separated environment files for backend and frontend domains:

### Exact File Paths & Roles
1. **`server/.env`** (Active Backend Runtime):
   - Located at: `server/.env`
   - **Loaded at runtime** by the Express backend via [`server/src/config/env.ts`](file:///d:/Freelances/projects/Mobitech/MobiTech/server/src/config/env.ts).
   - Contains all private server secrets (database credentials, JWT secret, Cloudinary API secret).
   - Strictly gitignored in `.gitignore`.
2. **`client/.env`** (Active Frontend Configuration):
   - Located at: `client/.env`
   - **Loaded at build/dev time** by Vite. Only variables prefixed with `VITE_` are exposed to the browser.
   - Strictly gitignored in `.gitignore`.
3. **`server/.env.example`** (Backend Template):
   - Located at: `server/.env.example`
   - Committed template showing required server variable names with safe placeholder values.
4. **`client/.env.example`** (Frontend Template):
   - Located at: `client/.env.example`
   - Committed template showing frontend variable names with safe placeholder values.
5. **`.env.example`** (Root Monorepo Overview):
   - Located at: `.env.example`
   - Overview template documenting both backend and frontend variable names for initial project setup.

### Backend Runtime Loading Behavior
To prevent environment resolution bugs when running from different working directories (e.g. workspace root vs `server` directory), the backend uses a resilient loader in [`server/src/config/env.ts`](file:///d:/Freelances/projects/Mobitech/MobiTech/server/src/config/env.ts):
- It checks `process.cwd()/.env`, `process.cwd()/server/.env`, and paths relative to `__dirname`.
- It validates essential configuration at startup and warns if Cloudinary credentials are unconfigured.

### Backend Configuration Variables (`server/.env`)
These variables must reside in `server/.env`:

| Variable | Description | Example / Safe Placeholder |
| :--- | :--- | :--- |
| `PORT` | HTTP port the server listens on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mobitech` |
| `CLIENT_URL` | Frontend URL permitted by CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret key used to sign and verify admin tokens | *Min 32 characters random string* |
| `ADMIN_EMAIL` | Seed admin account email | `admin@example.com` |
| `ADMIN_PASSWORD` | Seed admin account password | *Secure password* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |

> [!CAUTION]
> Never put `CLOUDINARY_API_SECRET`, `JWT_SECRET`, or `MONGODB_URI` into `client/.env` or any `VITE_*` variable. Client variables are compiled into public JavaScript bundles.

### Frontend Configuration Variables (`client/.env`)
These variables must reside in `client/.env`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend REST API requests | `http://localhost:5000/api` |
| `VITE_WHATSAPP_NUMBER` | WhatsApp business order notification number | `919876543210` |

---

## 3. Configuring Cloudinary Locally

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Open `server/.env` (create it from `server/.env.example` if it does not exist) and set:
   ```env
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```
4. Start the backend:
   ```bash
   npm --prefix server run dev
   ```
5. If variables are missing, the server will log a safe notice at startup:
   `! Cloudinary image storage NOT configured (Missing: CLOUDINARY_CLOUD_NAME, ...). Image uploads will return 503.`
   When credentials are supplied, image uploads will immediately succeed without server restart issues.

---

## 4. File Types & Upload Limits

| Specification | Limit | Enforcement Layer | Response Code |
| :--- | :--- | :--- | :--- |
| **Accepted Formats** | JPEG, PNG, WebP | Client `validateImageFileType`<br>Server Multer filter<br>Server `isValidImageBuffer` magic bytes | `415 Unsupported Media Type` (Multer)<br>`400 Bad Request` (Invalid content) |
| **Max Photos** | 5 per product | Client `ImageUploader`<br>Server `createProductSchema` | `400 Bad Request` |
| **Client Compression Target** | Max 2000px longest edge<br>Adaptive quality 0.85 -> 0.72 | Client `optimizeImage` (Canvas API) | Automatic |
| **PNG Transparency** | Alpha channel scanned and preserved as PNG/WebP | Client `hasCanvasTransparency` | Automatic |
| **Max Server Upload File Size** | 5 MB | Server Multer limit | `413 Payload Too Large` |
| **Base64 Prevention** | Raw `data:image/...` strings disallowed in product documents | Zod `product.validator.ts` | `400 Bad Request` |

---

## 5. HTTP Error Diagnostic Codes

| Status Code | Error Code | Cause | Actionable Solution |
| :--- | :--- | :--- | :--- |
| `400` | `NO_FILE_PROVIDED` | Missing `image` field in multipart request | Ensure form field is named `image`. |
| `400` | `INVALID_IMAGE_CONTENT` | Disguised file or invalid magic bytes | Upload an authentic JPEG, PNG, or WebP photo. |
| `401` | `UNAUTHORIZED` | Admin token missing or expired | Re-authenticate via admin login. |
| `413` | `FILE_TOO_LARGE` | File exceeds 5MB limit | Select photo under 5MB or let client optimizer compress. |
| `415` | `UNSUPPORTED_MEDIA_TYPE`| Non-supported format (GIF, PDF, SVG, TXT) | Choose JPEG, PNG, or WebP. |
| `429` | `UPSTREAM_RATE_LIMITED` | Cloudinary API quota / rate limit reached | Wait momentarily before retrying. |
| `502` | `UPSTREAM_AUTH_FAILED` | Cloudinary credentials rejected upstream | Verify `CLOUDINARY_API_KEY` and secret in `server/.env`. |
| `503` | `STORAGE_NOT_CONFIGURED`| Missing Cloudinary credentials on server | Add credentials to `server/.env`. |
| `504` | `UPSTREAM_TIMEOUT` | Network timeout reaching Cloudinary | Check internet connection and upstream status. |

---

## 6. How to Run Tests

### Backend Unit & Integration Tests (Vitest)
```bash
npm --prefix server run test
```
Tests cover:
- Environment loading and safe diagnostic checks (`src/config/env.test.ts`).
- Magic bytes file signature validation (`src/utils/imageValidation.test.ts`).
- Cloudinary delivery URL transformations (`src/utils/deliveryOptimizer.test.ts`).
- Product schema Base64 rejection & image reference storage (`src/models/product.image.test.ts`).
- Complete `/api/upload/image` route (200, 401, 413, 415, 400, 503, 502, 504, 429) (`src/routes/upload.test.ts`).
- Product schema constraints & Mongoose limits (`src/validators/product.validator.test.ts`).

### TypeScript Build & Linting
```bash
# Server checks
npm --prefix server run lint
npm --prefix server run build

# Client checks
npm --prefix client run lint
npm --prefix client run build
```
