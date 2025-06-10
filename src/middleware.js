import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

const cookieConfig = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60, // 1 week
};

// Helper function to get token from request (similar to next-auth approach)
async function getToken(request) {
  // First try getting from cookies() which works in Server Components
  const cookieStore = cookies();
  let token = cookieStore.get("token")?.value;
  token = token || request.cookies.get("token")?.value;
  console.log("middleware - token:", token); // Log the token value

  // If not found, try getting from request cookies (for API routes)
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
          const [key, ...rest] = c.trim().split("=");
          return [key, rest.join("=")];
        })
      );
      token = cookies.token;
    }
  }

  return token;
}

export async function middleware(request) {
  const { nextUrl } = request;
  let pathname = nextUrl.pathname;

  // Normalize path (remove trailing slash except for root)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  // Get token using the helper function
  const token = await getToken(request);
  console.log(`Middleware - Path: ${pathname}, Token: ${!!token}`);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Handle auth routes (login, signup, etc.)
  if (isAuthRoute) {
    console.log("Middleware - Auth route detected:", pathname);
    if (token) {
      console.log("Middleware - Token found on auth route, verifying...");
      try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        console.log("Middleware - Token is valid, redirecting to dashboard.");

        // User is authenticated but trying to access auth route - redirect to dashboard
        const response = NextResponse.redirect(
          new URL("/blogs/dashboard", nextUrl)
        );
        // Ensure cookie is properly set in the response
        response.cookies.set("token", token, cookieConfig);
        return response;
      } catch (error) {
        console.log(
          "Middleware - Invalid token on auth route, clearing token."
        );
        // Invalid token - clear it and allow access to auth route
        const response = NextResponse.next();
        response.cookies.delete("token");
        return response;
      }
    }
    console.log("Middleware - No token found on auth route, proceeding.");
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute) {
    console.log("Middleware - Protected route detected:", pathname);
    if (!token) {
      console.log(
        "Middleware - No token found on protected route, redirecting to login."
      );
      // No token - redirect to login
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    console.log("Middleware - Token found on protected route, verifying...");
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      console.log("Middleware - Token is valid, proceeding.");

      // Valid token - proceed with request
      const response = NextResponse.next();
      // Refresh cookie expiration
      response.cookies.set("token", token, cookieConfig);
      return response;
    } catch (error) {
      console.log(
        "Middleware - Invalid token on protected route, clearing token and redirecting to login."
      );
      // Invalid token - clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", nextUrl));
      response.cookies.delete("token");
      return response;
    }
  }

  // For non-protected, non-auth routes
  console.log(
    "Middleware - Non-protected/non-auth route, proceeding:",
    pathname
  );
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
