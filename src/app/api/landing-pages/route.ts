import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { getLandingPages, createLandingPage, isSlugTaken } from '@/lib/firestore';
import { validateLandingPageForm } from '@/lib/validation';

/**
 * GET /api/landing-pages
 * Returns admin's landing pages with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const pages = await getLandingPages({
      status: status || undefined,
      category: category || undefined,
      search: search || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: pages,
        count: pages.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/landing-pages error:', error);
    return NextResponse.json(
      { error: 'Server error fetching landing pages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/landing-pages
 * Creates a new landing page
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate form data
    const errors = validateLandingPageForm(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Check if slug is unique
    if (await isSlugTaken(body.slug)) {
      return NextResponse.json(
        { error: 'Validation failed', errors: { slug: 'Slug is already taken' } },
        { status: 400 }
      );
    }

    // Create landing page
    const pageId = await createLandingPage(body, admin.uid);

    // Log audit event
    await logAuditEvent(
      'page_created',
      admin.uid,
      'landingPage',
      pageId,
      undefined,
      request.ip
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Landing page created successfully',
        pageId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/landing-pages error:', error);
    return NextResponse.json(
      { error: 'Server error creating landing page' },
      { status: 500 }
    );
  }
}
