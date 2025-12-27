import { adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Types
export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  canonicalUrl: string;
  businessName: string;
  businessCategory: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  businessLocation: string;
  htmlContent: string;
  status: 'draft' | 'published' | 'archived';
  isPublished: boolean;
  publishedAt: FieldValue | null;
  expiresAt: FieldValue | null;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  createdBy: string;
  updatedBy: string;
  viewCount?: number;
  lastViewedAt?: FieldValue | null;
}

/**
 * Get all landing pages for admin dashboard
 * @param filters Optional filters (status, category, search)
 * @returns Array of landing pages
 */
export async function getLandingPages(
  filters?: { status?: string; category?: string; search?: string }
): Promise<LandingPage[]> {
  let query: any = adminDb!.collection('landingPages');

  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  }

  if (filters?.category) {
    query = query.where('businessCategory', '==', filters.category);
  }

  // Order by updated date descending
  query = query.orderBy('updatedAt', 'desc');

  const snapshot = await query.get();
  const pages: LandingPage[] = [];

  snapshot.forEach((doc) => {
    pages.push({
      id: doc.id,
      ...doc.data(),
    } as LandingPage);
  });

  // Client-side search filtering
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower) ||
        page.businessName.toLowerCase().includes(searchLower)
    );
  }

  return pages;
}

/**
 * Get landing page by ID
 * @param id Document ID
 * @returns Landing page or null
 */
export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  const doc = await adminDb!.collection('landingPages').doc(id).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as LandingPage;
}

/**
 * Get landing page by slug
 * @param slug Page slug
 * @returns Landing page or null
 */
export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const snapshot = await adminDb!
    .collection('landingPages')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as LandingPage;
}

/**
 * Check if slug is already taken
 * @param slug Slug to check
 * @param excludeId ID to exclude (for edit operations)
 * @returns true if slug is taken
 */
export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const snapshot = await adminDb!
    .collection('landingPages')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return false;

  // If excluding an ID, check if the slug belongs to that ID
  if (excludeId) {
    return snapshot.docs[0].id !== excludeId;
  }

  return true;
}

/**
 * Create landing page
 * @param data Page data
 * @param adminId ID of admin creating the page
 * @returns Document ID
 */
export async function createLandingPage(
  data: Partial<LandingPage>,
  adminId: string
): Promise<string> {
  const now = new Date();

  const pageData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
    isPublished: data.status === 'published',
    publishedAt: data.status === 'published' ? now : null,
    viewCount: 0,
    lastViewedAt: null,
  };

  const docRef = await adminDb!.collection('landingPages').add(pageData);
  return docRef.id;
}

/**
 * Update landing page
 * @param id Document ID
 * @param data Updated page data
 * @param adminId ID of admin updating the page
 * @returns true if successful
 */
export async function updateLandingPage(
  id: string,
  data: Partial<LandingPage>,
  adminId: string
): Promise<boolean> {
  const now = new Date();
  const oldDoc = await getLandingPageById(id);

  if (!oldDoc) return false;

  const updateData = {
    ...data,
    updatedAt: now,
    updatedBy: adminId,
    isPublished: data.status === 'published',
  };

  // If changing status to published, set publishedAt
  if (data.status === 'published' && !oldDoc.isPublished) {
    updateData.publishedAt = now;
  }
  // If changing status to draft/archived, clear publishedAt
  if (data.status !== 'published' && oldDoc.isPublished) {
    updateData.publishedAt = null;
  }

  await adminDb!.collection('landingPages').doc(id).update(updateData);
  return true;
}

/**
 * Delete landing page
 * @param id Document ID
 * @returns true if successful
 */
export async function deleteLandingPage(id: string): Promise<boolean> {
  const doc = await getLandingPageById(id);
  if (!doc) return false;

  await adminDb!.collection('landingPages').doc(id).delete();
  return true;
}

/**
 * Get all published landing pages (for static generation)
 * @returns Array of published pages
 */
export async function getPublishedLandingPages(): Promise<LandingPage[]> {
  const snapshot = await adminDb!
    .collection('landingPages')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();

  const pages: LandingPage[] = [];
  snapshot.forEach((doc) => {
    pages.push({
      id: doc.id,
      ...doc.data(),
    } as LandingPage);
  });

  return pages;
}

/**
 * Increment page view count
 * @param id Document ID
 */
export async function incrementPageViewCount(id: string): Promise<void> {
  await adminDb!.collection('landingPages').doc(id).update({
    viewCount: adminDb!.FieldValue.increment(1),
    lastViewedAt: new Date(),
  });
}
