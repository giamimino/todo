import { getUser } from "@/lib/cache";
import { NextResponse } from "next/server";

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message
  })
}

export async function GET() {
  try {
    const user = await getUser()
    return NextResponse.json({
      success: true,
      user
    })
  } catch (err) {
    console.log(err);
    return errorResponse("Something went wrong.")
  }
}