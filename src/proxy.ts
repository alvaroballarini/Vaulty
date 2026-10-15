import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/privacidad",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  const session = request.cookies.get("session");
  /**
   * Usuario NO logueado intentando entrar
   * a una ruta privada
   */
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /**
   * Usuario logueado intentando volver
   * al login
   */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/.well-known/appspecific/:path*",
  ],
};
