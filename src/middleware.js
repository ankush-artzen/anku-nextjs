import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = [
  "/blogs/create",
  "/blogs/edit",
  "/blogs/dashboard",
];

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(req) {
  const url = req.nextUrl;
  let pathname = url.pathname;

  // Normalize trailing slash (except root "/")
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
    console.log("Normalized pathname:", pathname);
  }

  console.log("Request URL:", url.href);
  console.log("Pathname:", pathname);

  // Check all cookies
  console.log("All cookies:", req.cookies.getAll());

  const token = req.cookies.get("token")?.value;
  console.log("Token from cookies:", token);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  console.log("Is protected route:", isProtectedRoute);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  console.log("Is auth route:", isAuthRoute);

  // Redirect logged-in users away from auth routes
  if (isAuthRoute && token) {
    console.log("User is on an auth route with token. Verifying token...");
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      console.log("Token valid. Redirecting to dashboard...");
      return NextResponse.redirect(new URL("/blogs/dashboard", req.url));
    } catch (err) {
      console.log("Token verification failed:", err.message);
      return NextResponse.next();
    }
  }

  // Enforce token for protected routes
  if (isProtectedRoute) {
    console.log("User is on a protected route.");
    if (!token) {
      console.log("No token found. Redirecting to login...");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      console.log("Token is valid. Proceeding to protected page.");
    } catch (err) {
      console.log("Invalid token. Redirecting to login and clearing cookie...");
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("token", "", {
        maxAge: -1,
        path: "/",
      });
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
