import { NextRequest, NextResponse } from 'next/server';
import { getAdminTokenFromRequest, isAdminTokenValid } from './src/lib/adminAuth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = getAdminTokenFromRequest(request);

    if (!token || !isAdminTokenValid(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
