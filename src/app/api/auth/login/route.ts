import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie, verifyAdminToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Verifies Firebase ID token and creates session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: token is required' },
        { status: 400 }
      );
    }

    // Verify token and check admin status
    const admin = await verifyAdminToken(token);

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have admin access' },
        { status: 403 }
      );
    }

    // Set auth cookie
    await setAuthCookie(token);

    // Return admin data (without sensitive info)
    return NextResponse.json(
      {
        success: true,
        admin: {
          uid: admin.uid,
          email: admin.email,
          displayName: admin.displayName || '',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error during login' },
      { status: 500 }
    );
  }
}
