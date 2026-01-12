import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map hostnames to allowed routes
// Update these hostnames after creating your Vercel domains
const domainRouteMap: Record<string, string[]> = {
  // Vercel preview/production domains - add your actual domains here
  "numerology-aw.vercel.app": ["/numerology/aw"],
  "life-path-calc.vercel.app": ["/life-path"],
  "astro-calc.vercel.app": ["/astro"],
  "transits-calc.vercel.app": ["/transits"],
  "relocation-calc.vercel.app": ["/relocation"],

  // Add custom domains here as needed
  // "numerology.yourdomain.com": ["/numerology/aw"],
};

// Routes that should always be accessible (for assets, api, etc.)
const alwaysAllowed = ["/_next", "/api", "/ephe", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Allow static assets and API routes
  if (alwaysAllowed.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Check if this hostname has route restrictions
  const allowedRoutes = Object.entries(domainRouteMap).find(([domain]) =>
    hostname.includes(domain.replace(".vercel.app", ""))
  )?.[1];

  if (allowedRoutes) {
    // Check if current path is allowed for this domain
    const isAllowed =
      pathname === "/" ||
      allowedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

    if (!isAllowed) {
      // Redirect to the primary allowed route for this domain
      const redirectUrl = new URL(allowedRoutes[0], request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If on root, redirect to the calculator
    if (pathname === "/") {
      const redirectUrl = new URL(allowedRoutes[0], request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
