import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { getLandingPageById, updateLandingPage } from '@/lib/firestore';
import { triggerRebuild } from '@/lib/rebuild';

/**
 * POST /api/landing-pages/[id]/publish
 * Toggles publish status and triggers rebuild
 */
export async function POST(
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
    const { publish } = body; // true to publish, false to unpublish

    if (typeof publish !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: publish must be boolean' },
        { status: 400 }
      );
    }

    // Check if page exists
    const page = await getLandingPageById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    // Determine new status
    const newStatus = publish ? 'published' : 'draft';

    // Skip if already in desired state
    if (page.status === newStatus) {
      return NextResponse.json(
        {
          success: true,
          message: `Page is already ${newStatus}`,
          page: { ...page, status: newStatus },
        },
        { status: 200 }
      );
    }

    // Update page status
    const oldPage = { ...page };
    const success = await updateLandingPage(
      id,
      { status: newStatus },
      admin.uid
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update page status' },
        { status: 400 }
      );
    }

    // Log audit event
    await logAuditEvent(
      publish ? 'page_published' : 'page_unpublished',
      admin.uid,
      'landingPage',
      id,
      { before: oldPage, after: { ...oldPage, status: newStatus } },
      request.ip
    );

    // Trigger rebuild (fire and forget)
    // Don't block response waiting for rebuild
    triggerRebuild()
      .catch((error) => console.error('Failed to trigger rebuild:', error));

    return NextResponse.json(
      {
        success: true,
        message: `Page ${publish ? 'published' : 'unpublished'} successfully. Rebuilding site...`,
        page: { ...page, status: newStatus },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/landing-pages/[id]/publish error:', error);
    return NextResponse.json(
      { error: 'Server error updating page status' },
      { status: 500 }
    );
  }
}
