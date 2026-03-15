import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect authenticated users away from auth page
    if (pathname === "/auth" && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes - no auth required
        const publicRoutes = ["/", "/auth", "/api/auth"];
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/")
        );

        // Public API routes
        const publicApiRoutes = ["/api/v1/hazards", "/api/v1/exports"];
        const isPublicApi = publicApiRoutes.some(
          (route) => pathname.startsWith(route) && req.method === "GET"
        );

        if (isPublicRoute || isPublicApi) {
          return true;
        }

        // Protected routes require auth
        const protectedRoutes = ["/report/new", "/profile"];
        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route)
        );

        if (isProtectedRoute) {
          return !!token;
        }

        // Allow everything else
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
