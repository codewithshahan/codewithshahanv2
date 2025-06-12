import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if this is a preview request
  const isPreview = request.nextUrl.pathname.includes("/@preview");

  if (isPreview) {
    // Get the original pathname
    const pathname = request.nextUrl.pathname.replace("/@preview", "");

    // Clone the request headers
    const requestHeaders = new Headers(request.headers);

    // Add the pathname header
    requestHeaders.set("x-pathname", pathname);

    // Return the response with the new headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
