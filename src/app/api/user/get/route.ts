import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message
  })
}

export async function GET() {
  try {
    const sessionId = (await cookies()).get("sessionId")?.value
    const cachedUserKey = `cachedUser:${sessionId}`
    const cachedUser = await redis.get(cachedUserKey)
    if(cachedUser) {
      return NextResponse.json({
        success: true,
        user: cachedUser
      })
    }
    const sessionRedisKey = `session:${sessionId}`
    const userId = await redis.get(sessionRedisKey) as string
    if(!userId) {
      return errorResponse("user can't be found")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true,
        todo: {
          select: {
            title: true,
            description: true,
            deadline: true,
            group: {
              select: {
                title: true,
              }
            }
          }
        }
      },
    })
    
    
    if(!user) {
      return errorResponse("user can't be found")
    }

    const response = {
      success: true,
      user
    };
    
    (async () => {
      try {
        await redis.set(
          cachedUserKey,
          user,
          { ex: 60 * 10 }
        )
      } catch(err) {
        console.error(err);
      }
    })();

    return NextResponse.json(response)

  }catch(err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong."
    }
  }
}