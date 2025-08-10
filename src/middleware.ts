import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { redis } from "./lib/redis";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sessionId")?.value;
  const path = request.nextUrl.pathname;
  if(sessionId) {
    const session = await redis.get(`session:${sessionId}`)
    if(!session) {
      cookieStore.delete("sessionId")
      return NextResponse.redirect(new URL("/?auth=signup", request.url))
    }
  } else if (!sessionId && path.startsWith("/home")) {
    return NextResponse.redirect(new URL("/?auth=signup", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*"],
};