import { cache } from "react";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

export const getUser = cache(async () => {
  const sessionId = (await cookies()).get("sessionId")?.value;
  if (!sessionId) return null;

  const [cachedUser, userId] = await redis
    .multi()
    .get(`cachedUser:${sessionId}`)
    .get(`session:${sessionId}`)
    .exec();

  if (cachedUser) return cachedUser;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    select: {
      name: true,
      profileImage: true,
      todo: {
        select: {
          id: true,
          title: true,
          description: true,
          deadline: true,
          groupId: true,
        },
      },
      group: { select: { id: true, title: true } },
      favorite: { select: { id: true, todoId: true } },
    },
  });

  if (!user) return null;

  queueMicrotask(() => {
    (async () => {
      try {
        await redis.set(
          `cachedUser:${sessionId}`,
          { ...user, id: userId },
          { ex: 60 * 10 }
        );
      } catch (err) {
        console.error("Redis cache failed:", err);
      }
    })();
  });

  return { ...user, id: userId };
});
