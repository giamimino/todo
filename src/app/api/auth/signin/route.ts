import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import cuid from "cuid";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    if (!username || !password)
      return NextResponse.json({ success: false, message: "Missing fields" });

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, password: true },
    });
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json({
        success: false,
        message: "Incorrect password",
      });

    const sessionId = cuid();
    await redis.set(`session:${sessionId}`, user.id, { ex: 2 * 24 * 60 * 60 });

    const res = NextResponse.json({ success: true });
    res.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      success: false,
      message: "Something went wrong.",
    });
  }
}
