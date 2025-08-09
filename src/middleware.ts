import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  const path = request.nextUrl.pathname;
  if (!sessionId) {
    if (path.startsWith("/home")) {
      return NextResponse.redirect(new URL("/?auth=signup", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*"],
};