"use server";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { randomUUID } from "crypto";
import ImageKit from "imagekit";
import { cookies } from "next/headers";
import sharp from "sharp";

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
    const cachedUserKey = `cachedUser:${sessionId}`;
    const cachedUser = ((await redis.get(cachedUserKey)) || {}) as User;

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

    const sessionId = (await cookies()).get("sessionId")?.value;
    const cachedUserKey = `cachedUser:${sessionId}`;
    const cachedUser = (await redis.get(cachedUserKey)) as User;

    const newCachedUser = {
      ...cachedUser,
      group: [
        ...(cachedUser.group || []),
        { title: group.title, id: group.id },
      ],
    };

    await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });

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
      select: { id: true },
    });

    if (!group) {
      return { success: false, message: "Group can't be deleted." };
    }

    const sessionId = (await cookies()).get("sessionId")?.value;

    const cachedUserKey = `cachedUser:${sessionId}`;
    const cachedUser = (await redis.get(cachedUserKey)) as User;

    const newCachedUser = {
      ...cachedUser,
      group: cachedUser.group.filter((g) => g.id !== group.id),
    };

    await redis.set(cachedUserKey, JSON.stringify(newCachedUser), {
      ex: 60 * 10,
    });

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

    const sessionId = (await cookies()).get("sessionId")?.value;
    const cachedUserKey = `cachedUser:${sessionId}`;
    const cachedUser = (await redis.get(cachedUserKey)) as User;

    const newCachedUser = {
      ...cachedUser,
      favorite: [...(cachedUser.favorite || []), favorite],
    };
    await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });

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

    const sessionId = (await cookies()).get("sessionId")?.value;
    const cachedUserKey = `cachedUser:${sessionId}`;
    const cachedUser = (await redis.get(cachedUserKey)) as User;

    const newCachedUser = {
      ...cachedUser,
      favorite: cachedUser.favorite?.filter((f) => f.id !== favorite.id),
    };
    await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 });

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

export async function editTask(formData: FormData, taskId: string) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
      return {
        success: false,
        message: "Some required fields are missing.",
      };
    }

    const task = await prisma.todo.update({
      where: { id: taskId },
      data: { title, description },
      select: { id: true },
    });
    if (!task) {
      return {
        success: false,
        message: "please try again, task can't be edited.",
      };
    }

    const sessionId = (await cookies()).get("sessionId")?.value;
    const sessionRedisKey = `cachedUser:${sessionId}`;
    const cachedUser = (await redis.get(sessionRedisKey)) as User;

    const newCachedUser = {
      ...cachedUser,
      todo: cachedUser.todo.map((t) =>
        t.id === task.id
          ? {
              ...t,
              title,
              description,
            }
          : t
      ),
    };

    await redis.set(sessionRedisKey, newCachedUser, { ex: 60 * 10 });

    return {
      success: true,
      taskId: task.id,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function updateProfile(formData: FormData, image: File, userId: string) {
  const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  })
  try {
    const name = formData.get("name") as string
  
    if(!name) {
      return {
        success: false,
        message: "Name field are required."
      }
    }
    let imageUrl:string = ""
    if (image && image.size > 0 && image.type.startsWith("image/")) {
      const arrayBuffer = await image.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      let outputBuffer: Buffer;
      let quality = 60;

      outputBuffer = await sharp(inputBuffer)
        .resize(64, 64)
        .webp({ quality })
        .toBuffer();

      const uploaded = await imageKit.upload({
        file: outputBuffer,
        fileName: `profile-${userId}.webp`,
        folder: "/posts/todo-user-images",
        overwriteFile: true,
        overwriteAITags: true,
        overwriteCustomMetadata: true,
        overwriteTags: true,
      });

      imageUrl = uploaded.url;
    }
  
    const profile = await prisma.user.update({
      where: { id: userId},
      data: {
        name,
        ...(imageUrl !== "" ? { profileImage: imageUrl } : {})
      },
      select: {
        name: true,
        profileImage: true,
      }
    })

    if(!profile) {
      return {
        success: false,
        message: "Profile can't be edited. try again."
      }
    }

    const sessionId = (await cookies()).get("sessionId")?.value
    const cachedUserKey = `cachedUser:${sessionId}`
    const cachedUser = await redis.get(cachedUserKey) as User

    if(cachedUser) {
      const newCachedUser: User = {
        ...cachedUser,
        name: profile.name,
        profileImage: profile.profileImage
      }

      await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10})
    }

    return {
      success: true,
      profile
    }
  }catch(err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong."
    }
  }
}
