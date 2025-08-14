import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Todo = {
  id: string,
  title: string,
  description: string,
  deadline: Date,
  group: { title: string } | null
}

type User = {
  id: string,
  name: string,
  profileImage: string,
  todo: Todo[]
}

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message
  })
}

export async function POST(req: Request) {
  try {
    const { taskId }: { taskId: string } = await req.json()

    await prisma.todo.delete({ where: { id: taskId } });

    (async () => {
      try {
        const sessionId = (await cookies()).get("sessionId")?.value
        const cachedUserKey = `cachedUser:${sessionId}`
        const cachedUser = await redis.get(cachedUserKey) as User;
        if(!cachedUser) return

        const newCachedUser = {
          ...cachedUser,
          todo: cachedUser.todo.filter((todo) => todo.id !== taskId )
        }

        await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 })
      }catch(err) {
        console.log(err);
      }
    })();

    return NextResponse.json({
      success: true,
      taskId
    })
  }catch(err) {
    console.log(err);
    return errorResponse("Something went wrong.")
  }
}