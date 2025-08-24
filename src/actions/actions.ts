"use server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

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
  group: Groups[];
  favorite: { id: string; todoId: string }[] | null;
};

type Groups = {
  id: string;
  title: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  groupId: string | null;
};

type AddTaskSuccess = {
  success: true;
  task: Task;
};

type AddTaskError = {
  success: false;
  message: string;
};

export async function addTask(
  formData: FormData,
  groupId?: string
): Promise<AddTaskSuccess | AddTaskError> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadlineStr = formData.get("deadline") as string;
    const deadline = deadlineStr ? new Date(deadlineStr) : null;

    if (!title || !description || !deadlineStr) {
      return {
        success: false,
        message: "Some required fields are missing.",
      };
    }

    const sessionId = (await cookies()).get("sessionId")?.value;
    const sessionRedisKey = `session:${sessionId}`;
    const userId = (await redis.get(sessionRedisKey)) as string;
    if (!userId) {
      return {
        success: false,
        message: "Not authenticated.",
      };
    }

    const task = await prisma.todo.create({
      data: {
        title,
        description,
        deadline: deadline || new Date(),
        user: { connect: { id: userId } },
        ...(groupId ? { group: { connect: { id: groupId } } } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        groupId: true,
      },
    });

    if (!task) {
      return {
        success: false,
        message: "Task can't be created.",
      };
    }

    (async () => {
      try {
        const cachedUserKey = `cachedUser:${sessionId}`;
        const cachedUser = (await redis.get(cachedUserKey)) as User;
        if (!cachedUser) return;

        const newCachedUser: User = {
          ...cachedUser,
          todo: [
            ...(cachedUser.todo || []),
            {
              id: task.id,
              title: task.title,
              description: task.description,
              deadline: task.deadline,
              groupId: task.groupId || null,
            },
          ],
        };

        await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });
      } catch (err) {
        console.log(err);
      }
    })();

    return { success: true, task };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function addGroup(formData: FormData, userId: string) {
  try {
    const title = formData.get("title") as string;
    if (!title) {
      return {
        success: false,
        message: "Some required fields are missing.",
      };
    }

    const group = await prisma.group.create({
      data: {
        title,
        userId,
      },
      select: {
        id: true,
        title: true,
      },
    });
    if (!group) {
      return {
        success: false,
        message: "Group can't be created.",
      };
    }

    (async () => {
      const sessionId = (await cookies()).get("sessionId")?.value;
      const cachedUserKey = `cachedUser:${sessionId}`;
      const cachedUser = (await redis.get(cachedUserKey)) as User;
      if (!cachedUser) return;

      const newCachedUser = {
        ...cachedUser,
        group: [
          ...(cachedUser.group ?? []),
          {
            title: group.title,
            id: group.id,
          },
        ],
      };

      await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });
    })();

    return {
      success: true,
      group,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function GroupRemove(groupId: string) {
  try {
    const group = await prisma.group.delete({
      where: { id: groupId },
      select: {
        id: true,
      },
    });

    if (!group) {
      return {
        success: false,
        message: "Group can't be deleted.",
      };
    }

    (async () => {
      const sessionId = (await cookies()).get("sessionId")?.value;
      const cachedUserKey = `cachedUser:${sessionId}`;
      const cachedUser = (await redis.get(cachedUserKey)) as User;
      if (!cachedUser) return;

      const newCachedUser = {
        ...cachedUser,
        group: cachedUser.group.filter((g) => g.id !== groupId)
      };
      await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });
    })();

    return {
      success: true,
      groupId: group.id,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function addFavorite(taskId: string, userId: string) {
  try {
    const favorite = await prisma.favorite.create({
      data: {
        user: { connect: { id: userId } },
        todo: { connect: { id: taskId } },
      },
      select: {
        id: true,
        todoId: true,
      },
    });

    if (!favorite) {
      return {
        success: false,
        messagee: "Task can't be added in favorites.",
      };
    }

    (async () => {
      const sessionId = (await cookies()).get("sessionId")?.value;
      const cachedUserKey = `cachedUser:${sessionId}`;
      const cachedUser = (await redis.get(cachedUserKey)) as User;
      if (!cachedUser) return;

      const newCachedUser = {
        ...cachedUser,
        favorite: [...(cachedUser.favorite || []), favorite],
      };
      await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });
    })();

    return {
      success: true,
      favorite,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function removeFavorite(favoriteId: string) {
  try {
    const favorite = await prisma.favorite.delete({
      where: { id: favoriteId },
      select: { id: true },
    });

    if (!favorite) {
      return {
        success: false,
        messagee: "Task can't be removed from favorites.",
      };
    }

    (async () => {
      const sessionId = (await cookies()).get("sessionId")?.value;
      const cachedUserKey = `cachedUser:${sessionId}`;
      const cachedUser = (await redis.get(cachedUserKey)) as User;
      if (!cachedUser) return;

      const newCachedUser = {
        ...cachedUser,
        favorite: cachedUser.favorite?.filter((f) => f.id !== favorite.id),
      };
      await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });
    })();

    return {
      success: true,
      favorite,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}
