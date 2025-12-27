# KashPages Admin System Implementation Guide

## Overview

This document details the admin authentication, dashboard, and page management system implementation for KashPages.

## Architecture

### Security Model (CRITICAL)

**No Token in Client Storage:**
- Firebase ID token is obtained on client but never stored in localStorage/sessionStorage
- Token is immediately sent to `/api/auth/login` to set HTTP-only cookie
- All subsequent requests use the HTTP-only cookie (automatic, cannot be accessed by JavaScript)
- Cookie is secure: `httpOnly=true`, `sameSite=lax`, `secure=true` in production

**Authorization Flow:**
1. Admin logs in with Firebase Auth (email or Google)
2. Client retrieves ID token from Firebase
3. Client POSTs token to `/api/auth/login`
4. Server verifies token using Firebase Admin SDK
5. Server checks if user UID exists in `admins` collection
6. Server sets HTTP-only cookie with token
7. All future requests include cookie automatically
8. Next.js middleware validates cookie for `/admin/*` routes

**Why This Approach:**
- Prevents XSS attacks from stealing tokens (can't be accessed by JavaScript)
- Prevents CSRF with `sameSite=lax`
- Server-side validation ensures only admins access protected routes
- Admin status is verified on every request (not just on login)

---

## Files Implemented

### Core Infrastructure

#### `src/lib/firebase.ts`
- Client-side Firebase initialization
- Exports `auth` and `db` for use in components
- Only initializes on browser (checks `typeof window`)

#### `src/lib/firebaseAdmin.ts`
- Server-side Firebase Admin SDK initialization
- Private key loaded from base64-encoded environment variable
- Exports `adminAuth` and `adminDb` for server-side operations

#### `src/lib/auth.ts`
Server-side auth utilities:
- `verifyAdminToken(token)`: Verify Firebase ID token + check admin status
- `setAuthCookie(token)`: Set HTTP-only cookie
- `getAuthCookie()`: Retrieve cookie from request
- `clearAuthCookie()`: Clear cookie on logout
- `getCurrentAdmin()`: Get current admin from request
- `logAuditEvent()`: Log admin actions for audit trail

#### `src/middleware.ts`
Next.js middleware for route protection:
- Protects all `/admin/*` routes
- Allows `/admin/login` without auth
- Redirects unauthenticated users to `/admin/login`
- Verifies token using Firebase Admin SDK
- Checks admin collection
- Clears invalid cookies

### API Routes

#### `src/app/api/auth/login/route.ts`
**POST /api/auth/login**
- Accepts Firebase ID token from client
- Verifies token and admin status
- Sets HTTP-only auth cookie
- Returns admin data (uid, email, displayName)
- Returns 403 if user is not admin

#### `src/app/api/auth/logout/route.ts`
**POST /api/auth/logout**
- Clears auth cookie
- No validation needed (anyone can call this)

#### `src/app/api/landing-pages/route.ts`
**GET /api/landing-pages**
- Protected: requires auth
- Returns list of landing pages
- Supports filtering: `?status=draft&category=retail&search=text`
- Returns empty array if no pages found

**POST /api/landing-pages**
- Protected: requires auth
- Creates new landing page
- Validates all form data
- Checks slug uniqueness
- Returns 201 with pageId on success
- Returns 400 with validation errors
- Logs audit event

#### `src/app/api/landing-pages/[id]/route.ts`
**GET /api/landing-pages/[id]**
- Protected: requires auth
- Returns single page by ID
- Returns 404 if not found

**PUT /api/landing-pages/[id]**
- Protected: requires auth
- Updates existing page
- Validates all form data
- Checks slug uniqueness (excluding current page)
- Handles status transitions properly
- Logs audit event with before/after data

**DELETE /api/landing-pages/[id]**
- Protected: requires auth
- Deletes page
- Returns 404 if not found
- Logs audit event
- Note: Deleted pages are removed from published pages (sitemap updated on next rebuild)

#### `src/app/api/landing-pages/[id]/publish/route.ts`
**POST /api/landing-pages/[id]/publish**
- Protected: requires auth
- Request body: `{ publish: boolean }`
- Toggles page status between draft and published
- Sets/clears `publishedAt` timestamp
- Triggers rebuild webhook (fire-and-forget)
- Returns immediately (rebuild happens async)
- Logs audit event

### Validation

#### `src/lib/validation.ts`
Comprehensive form validation:
- `validateSlug()`: Lowercase, URL-safe, 2-50 chars
- `generateSlug()`: Auto-generate from title
- `validateMetaDescription()`: 20-160 chars
- `validateUrl()`: Valid URL format
- `validateOgImage()`: Valid image URL
- `validateHtmlContent()`: Not empty, not too large
- `validateEmail()`: Email format
- `validatePhone()`: 7-20 chars
- `validateRequired()`: Non-empty field
- `validateLandingPageForm()`: Validate entire form, returns error object

All validation happens on both client and server for defense-in-depth.

### Client Hooks

#### `src/hooks/useAuth.ts`
Client-side authentication hook:
- `user`: Current authenticated user
- `loading`: Auth state loading
- `error`: Auth error message
- `loginWithEmail()`: Sign in with email/password
- `loginWithGoogle()`: Sign in with Google
- `logout()`: Sign out
- `isAdmin`: Whether user is admin

Flow:
1. Listens to Firebase auth state changes
2. When user logs in, sends token to `/api/auth/login`
3. Server sets cookie and verifies admin status
4. Component updates state
5. Redirect happens in component (useRouter)

### Firestore Integration

#### `src/lib/firestore.ts`
Database queries and operations:
- `getLandingPages()`: List all pages with filtering
- `getLandingPageById()`: Get single page by ID
- `getLandingPageBySlug()`: Get page by slug (for public pages)
- `isSlugTaken()`: Check slug uniqueness
- `createLandingPage()`: Create new page
- `updateLandingPage()`: Update page
- `deleteLandingPage()`: Delete page
- `getPublishedLandingPages()`: Get all published pages (for static generation)
- `incrementPageViewCount()`: Track page views

All queries use server-side Firebase Admin SDK (not client SDK).

### Rebuild Trigger

#### `src/lib/rebuild.ts`
Trigger site rebuild when pages are published:
- `triggerRebuild()`: Trigger via GitHub Actions
  - Uses `GITHUB_TOKEN` environment variable
  - Dispatches workflow: `deploy.yml` on main branch
  - Fire-and-forget (doesn't block response)
  - Logs error but doesn't throw

- `triggerNetlifyRebuild()`: Alternative Netlify build hook
  - Uses `NETLIFY_BUILD_HOOK_URL` environment variable
  - POST to build hook URL

### UI Components

#### `src/app/admin/login/page.tsx`
Admin login page:
- Email/password form
- Google OAuth button
- Shows Firebase auth errors
- Redirects to dashboard on success
- Redirects to dashboard if already logged in
- Professional UI with gradient background

#### `src/app/admin/dashboard/page.tsx`
Admin dashboard:
- List all landing pages in table
- Filter by status (all, draft, published)
- Columns: Business name, slug, status, updated date, actions
- Actions: Edit, Publish/Unpublish, Delete
- Delete requires confirmation
- Shows error messages
- Shows empty state with "create first page" button
- Logout button in header

#### `src/app/admin/dashboard/create/page.tsx`
Create new page:
- PageForm component
- Back button to dashboard
- Error handling
- Redirects to edit page after creation

#### `src/app/admin/dashboard/edit/[id]/page.tsx`
Edit existing page:
- Loads page from API
- PageForm component with initial data
- Shows loading state
- Shows 404 if page not found
- Shows "View Live" link if published
- Error handling

#### `src/components/admin/PageForm.tsx`
Reusable form for create/edit:
- Business Info section:
  - Business name, category, location
  - Phone, email, website (optional)
- SEO & Publishing section:
  - Slug (with auto-generation from title)
  - Meta title, meta description
  - OG title, OG description
  - Featured image URL (with preview)
- Landing Page Content section:
  - HTML editor (textarea with syntax highlighting)
- Publish section:
  - Status radio buttons (draft/published)
- Validation on blur and submit
- Shows field-level error messages
- Disables on submit

---

## Environment Variables Required

### Firebase Configuration (Public)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Firebase Admin SDK (Private)
```bash
# Service account JSON, base64-encoded
FIREBASE_ADMIN_SDK_KEY=base64_encoded_json
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

### Rebuild Triggers
```bash
# GitHub Actions
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO=Burhan-sheikh/kash-pages

# OR Netlify Build Hook
NETLIFY_BUILD_HOOK_URL=https://api.netlify.com/build_hooks/xxx
```

---

## Data Model (Firestore)

### Collection: `admins`
```typescript
{
  id: string;  // Firebase Auth UID
  email: string;  // Unique
  displayName: string;
  role: "superadmin" | "admin";
  permissions: {
    canCreatePages: boolean;
    canEditPages: boolean;
    canDeletePages: boolean;
    canPublish: boolean;
    canViewAnalytics: boolean;
  };
  lastLoginAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `landingPages`
```typescript
{
  id: string;  // Document ID
  title: string;
  slug: string;  // UNIQUE, indexed
  // ... (see foundation document)
}
```

### Collection: `auditLogs`
```typescript
{
  id: string;
  action: string;  // "page_created", "page_published", etc.
  adminId: string;
  targetType: "landingPage" | "siteMetadata";
  targetId: string;
  changes: { before: any; after: any };
  ipAddress: string;
  createdAt: Timestamp;
}
```

---

## Key Security Decisions

### 1. HTTP-Only Cookies
✅ Tokens stored in HTTP-only cookies (not localStorage)
✅ Cannot be accessed by JavaScript
✅ Protected against XSS attacks
✅ Automatic cookie inclusion in requests

### 2. Server-Side Validation
✅ All form data validated on server
✅ Slug uniqueness checked on server
✅ Admin status verified on every request
✅ Audit logging for all operations

### 3. Authorization
✅ Middleware redirects unauthenticated requests
✅ Every protected API route checks auth
✅ Admin collection check prevents privilege escalation
✅ No fallback access without admin document

### 4. Slug Uniqueness
✅ Checked on create (prevent duplicates)
✅ Checked on update (prevent conflicts)
✅ Unique index in Firestore for fast lookups
✅ Validation prevents invalid characters

### 5. Data Integrity
✅ `publishedAt` timestamp set when publishing
✅ `createdAt` and `updatedAt` immutable
✅ `createdBy` and `updatedBy` track who made changes
✅ Audit logs preserve history

### 6. Rebuild Trigger
✅ Fire-and-forget (doesn't block response)
✅ Errors logged but don't break operation
✅ GitHub Actions token (better than build hooks)
✅ Automatic deployment to Netlify

---

## Testing the Implementation

### 1. Setup Admin User
```javascript
// In Firebase Console:
// 1. Create user: admin@kashpages.in / password
// 2. Or enable Google OAuth
// 3. Get user UID from Auth section
// 4. Add to Firestore:
db.collection('admins').doc(UID).set({
  email: 'admin@kashpages.in',
  displayName: 'Admin',
  role: 'superadmin',
  permissions: {
    canCreatePages: true,
    canEditPages: true,
    canDeletePages: true,
    canPublish: true,
    canViewAnalytics: true,
  },
  createdAt: new Date(),
});
```

### 2. Test Login
- Visit `/admin/login`
- Sign in with email/password or Google
- Should redirect to `/admin/dashboard`

### 3. Test Page Creation
- Click "Create Page"
- Fill form
- Submit
- Should redirect to edit page
- Check Firestore for new document

### 4. Test Publishing
- Click "Publish" button
- Should trigger rebuild
- Check GitHub Actions or Netlify for deploy

### 5. Test Security
- Delete auth cookie: `document.cookie = 'kashpages_auth=; max-age=0'`
- Try to visit `/admin/dashboard`
- Should redirect to login

---

## Next Steps

1. **Public Landing Page Rendering** (`/[slug]` pages)
   - Generate static pages from Firestore
   - Set up meta tags properly
   - Generate sitemap.xml
   - Test with social media crawlers

2. **Build Pipeline**
   - Create GitHub Actions workflow for static generation
   - Deploy to Netlify
   - Configure domain

3. **Analytics**
   - Track page views
   - Add Google Analytics
   - Build analytics dashboard

4. **Firestore Security Rules**
   - Restrict writes to admin-only
   - Allow public reads for landing pages
   - Audit logs admin-only

---

## Production Checklist

- [ ] Firebase project created
- [ ] Service account key generated and base64 encoded
- [ ] Admin user created in Firestore
- [ ] GitHub Actions workflow created
- [ ] GITHUB_TOKEN set in GitHub Secrets
- [ ] Environment variables set in Netlify
- [ ] Domain configured in Netlify
- [ ] SSL certificate enabled
- [ ] Firestore security rules deployed
- [ ] Tests passing locally
- [ ] Deployed to Netlify
- [ ] Admin login working
- [ ] Page creation working
- [ ] Publish/rebuild working
