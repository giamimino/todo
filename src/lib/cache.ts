import { cache } from "react";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

export const getUser = cache(async () => {
  const sessionId = (await cookies()).get("sessionId")?.value;
  if (!sessionId) return null;

  const cachedUser = await redis.get(`cachedUser:${sessionId}`);
  if (cachedUser) return cachedUser;

  const userId = await redis.get(`session:${sessionId}`) as string
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      profileImage: true,
      todo: { select: { id: true, title: true, description: true, deadline: true, groupId: true } },
      group: { select: { id: true, title: true } },
      favorite: { select: { id: true, todoId: true }}
    },
  });

  if (!user) return null;

  await redis.set(`cachedUser:${sessionId}`, user, { ex: 60 * 10 });
  return user;
});
