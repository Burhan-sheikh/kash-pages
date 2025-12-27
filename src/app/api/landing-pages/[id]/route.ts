import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { getLandingPageById, updateLandingPage, deleteLandingPage, isSlugTaken } from '@/lib/firestore';
import { validateLandingPageForm } from '@/lib/validation';

/**
 * GET /api/landing-pages/[id]
 * Returns a single landing page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const page = await getLandingPageById(id);

    if (!page) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: page },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/landing-pages/[id] error:', error);
    return NextResponse.json(
      { error: 'Server error fetching landing page' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/landing-pages/[id]
 * Updates a landing page
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if page exists
    const oldPage = await getLandingPageById(id);
    if (!oldPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    // Validate form data
    const errors = validateLandingPageForm(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Check if new slug is unique (exclude current page)
    if (body.slug !== oldPage.slug && (await isSlugTaken(body.slug, id))) {
      return NextResponse.json(
        { error: 'Validation failed', errors: { slug: 'Slug is already taken' } },
        { status: 400 }
      );
    }

    // Update landing page
    const success = await updateLandingPage(id, body, admin.uid);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update landing page' },
        { status: 400 }
      );
    }

    // Log audit event
    await logAuditEvent(
      'page_updated',
      admin.uid,
      'landingPage',
      id,
      { before: oldPage, after: body },
      request.ip
    );

    return NextResponse.json(
      { success: true, message: 'Landing page updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/landing-pages/[id] error:', error);
    return NextResponse.json(
      { error: 'Server error updating landing page' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/landing-pages/[id]
 * Deletes a landing page
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if page exists
    const page = await getLandingPageById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    // Delete landing page
    const success = await deleteLandingPage(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete landing page' },
        { status: 400 }
      );
    }

    // Log audit event
    await logAuditEvent(
      'page_deleted',
      admin.uid,
      'landingPage',
      id,
      { before: page, after: null },
      request.ip
    );

    return NextResponse.json(
      { success: true, message: 'Landing page deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/landing-pages/[id] error:', error);
    return NextResponse.json(
      { error: 'Server error deleting landing page' },
      { status: 500 }
    );
  }
}
