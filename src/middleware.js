import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = [
  "/blogs/create",
  "/blogs/edit",
  "/blogs/dashboard",
];

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(req) {
  const url = req.nextUrl;

  // Normalize pathname: remove trailing slash except for root "/"
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const token = req.cookies.get("token")?.value;

  // If visiting auth page but already logged in, redirect to dashboard
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      return NextResponse.redirect(new URL("/blogs/dashboard", req.url));
    } catch {
      // Token invalid or expired, allow access to auth routes
      return NextResponse.next();
    }
  }

  // If visiting protected route, ensure token is valid
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
      // Invalid token: clear cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/blogs/create",
    "/blogs/edit/:path*",
    "/blogs/dashboard",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
