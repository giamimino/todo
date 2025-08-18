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

type Group = {
  id: string,
  title: string, 
}

type Todo = { 
  id: string; 
  title: string; 
  description: string; 
  deadline: Date; 
  group: Group | null 
}

type User = { 
  id: string; 
  name: string; 
  profileImage: string; 
  todo: Todo[]; 
  group?: Group[] | null 
}

export async function POST(req: Request) {
  try {
    const {groupId, taskId}: {
      groupId: string,
      taskId: string
    } = await req.json()

    if (!groupId || !taskId) {
      return errorResponse("Missing groupId or taskId");
    }


    const task = await prisma.todo.update({
      where: { id: taskId },
      data: {
        groupId
      },
      select: {
        group: {
          select: {
            title: true,
            id: true
          }
        }
      }
    })
    if(!task) return errorResponse("Something went wrong can't task in group.");

    (async () => {
      const sessionId = (await cookies()).get("sessionId")?.value
      const cachedUserRedisKey = `cachedUser:${sessionId}`
      const cachedUser = await redis.get(cachedUserRedisKey) as User

      const newCachedUser = {
        ...cachedUser,
        todo: cachedUser.todo.map((t) => t.id === taskId ? {
          ...t, 
          group: task.group
        } : t)
      }

      await redis.set(cachedUserRedisKey, newCachedUser, { ex: 60 * 10 })
    })();
    
    return NextResponse.json({
      success: true,
      task
    })
  }catch (err) {
    console.log(err);
    return errorResponse("Something went wrong.")
  }
}
