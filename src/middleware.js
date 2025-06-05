

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = [
  "/blogs/create",
  "/blogs/edit",
  "/blogs/dashboard",
];

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(req) {
  console.log("texttttt********************************************************")
  const url = req.nextUrl;
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const token = req.cookies.get("token")?.value;

  // If it's an auth route and user has a valid token, redirect to dashboard
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      return NextResponse.redirect(new URL("/blogs/dashboard", req.url));
    } catch {
      // Token is invalid, let them proceed to auth page
      return NextResponse.next();
    }
  }

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch (err) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token"); // Clear invalid token
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
