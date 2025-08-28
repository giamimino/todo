import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Group = {
  id: string;
  title: string;
};

type Todo = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  groupId: string | null;
};

type User = {
  id: string;
  name: string;
  profileImage: string;
  todo: Todo[];
  group?: Group[] | null;
};

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message,
  });
}

export async function POST(req: Request) {
  try {
    const { taskId }: { taskId: string } = await req.json();

    await prisma.todo.update({
      where: { id: taskId },
      data: {
        groupId: null,
      },
    });

    const sessionId = (await cookies()).get("sessionId")?.value;
    const sessionRedisKey = `cachedUser:${sessionId}`;
    const cachedUser = (await redis.get(sessionRedisKey)) as User;
    const newCachedUser = {
      ...cachedUser,
      todo: cachedUser.todo.filter((t) => t.id !== taskId),
    };

    await redis.set(sessionRedisKey, newCachedUser, { ex: 60 * 10 });

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    return errorResponse("Something went wrong.");
  }
}
