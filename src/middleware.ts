import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function checkBasicAuth(req: NextRequest): boolean {
  const pass = process.env.COMMAND_CENTER_PASSWORD?.trim();
  if (!pass) return true;

  const user = process.env.COMMAND_CENTER_USER?.trim();
  if (!user) return false;

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(":");
    if (colon < 0) return false;
    return decoded.slice(0, colon) === user && decoded.slice(colon + 1) === pass;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/api/ingest/report") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/showcase") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (!checkBasicAuth(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Grokbot Command Center"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};