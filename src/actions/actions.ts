'use server'
import prisma from "@/lib/prisma"
import { redis } from "@/lib/redis"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import cuid from 'cuid'

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