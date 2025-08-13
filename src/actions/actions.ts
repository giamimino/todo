'use server'
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import cuid from 'cuid'

type Todo = {
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

type Task = {
  title: string;
  description: string;
  deadline: Date;
  group: { title: string } | null;
};

type AddTaskSuccess = {
  success: true;
  task: Task;
};

type AddTaskError = {
  success: false;
  message: string;
}

export async function signup(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    if(!email || !username || !password) {
      return {
        success: false,
        message: "Some required fields are missing."
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: username,
        password: hashedPassword,
      },
      select: { id: true }
    })

    if(!user) {
      return {
        success: false,
        message: "User can't be created"
      }
    }

    const sessionId = cuid()
    const cookieStore = await cookies()
    cookieStore.set("sessionId", sessionId, {
      maxAge: 2 * 24 * 60 * 60, // 2 days
      secure: true,
      httpOnly: true,
    })

    const sessionRediskey = `session:${sessionId}`
    await redis.set(sessionRediskey, user.id, { ex: 2 * 24 * 60 * 60 })

    return {
      success: true
    }
  }catch(err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong."
    }
  }
}

export async function signin(formData: FormData) {
  try {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    if(!username || !password) {
      return {
        success: false,
        message: "Some required fields are missing."
      }
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        password: true
      }
    })

    if (!user) {
      return {
        success: false,
        message: "No user found with this username.",
      };
    }

    const checkPassword = await bcrypt.compare(password, user?.password)
    if (!checkPassword) {
      return {
        success: false,
        message: "Username or password is incorrect.",
      };
    }

    const sessionId = cuid()
    const cookieStore = await cookies()
    cookieStore.set("sessionId", sessionId, {
      maxAge: 2 * 24 * 60 * 60, // 2 days
      secure: true,
      httpOnly: true,
    })

    const sessionRediskey = `session:${sessionId}`
    await redis.set(sessionRediskey, user.id, { ex: 2 * 24 * 60 * 60 })

    return {
      success: true
    }
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong."
    }
  }
}

export async function addTask(formData: FormData): Promise<AddTaskSuccess | AddTaskError> {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const deadlineStr = formData.get("deadline") as string
    const deadline = deadlineStr ? new Date(deadlineStr) : null

    if(!title || !description || !deadlineStr) {
      return {
        success: false,
        message: "Some required fields are missing."
      }
    }

    const sessionId = (await cookies()).get("sessionId")?.value
    const sessionRedisKey = `session:${sessionId}`
    const userId = await redis.get(sessionRedisKey) as string
    if(!userId) {
      return {
        success: false,
        message: "Not authenticated."
      }
    }

    const task = await prisma.todo.create({
      data: {
        title,
        description,
        deadline: deadline || new Date(),
        user: { connect: { id: userId } }
      },
      select: {
        title: true,
        description: true,
        deadline: true,
        group: { select: { title: true } } 
      }
    })

    if(!task) {
      return {
        success: false,
        message: "Task can't be created"
      }
    }

    (async () => {
      try {
        const cachedUserKey = `cachedUser:${sessionId}`
        const cachedUser = await redis.get(cachedUserKey) as User;
        if (!cachedUser) return

        const newCachedUser: User = {
          ...cachedUser,
          todo: [
            ...(cachedUser.todo || []),
            {
              title: task.title,
              description: task.description,
              deadline: task.deadline,
              group: task.group ? task.group : null
            }
          ]
        }

        await redis.set(cachedUserKey, newCachedUser, { ex: 60 * 10 })
      }catch(err) {
        console.log(err);
      }
    })();

    return { success: true, task };
  }catch(err) {
    console.log(err);
    return {
      success: false,
      message: "Something went wrong."
    }
  }
}