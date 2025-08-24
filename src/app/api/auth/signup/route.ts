import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import cuid from "cuid";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!username || !email || !password)
      return NextResponse.json({ success: false, message: "Missing fields" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, name: username, password: hashedPassword },
      select: { id: true },
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
