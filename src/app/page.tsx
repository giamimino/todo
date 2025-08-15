'use client'
import InputForm from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from './page.module.scss';
import { signin, signup } from "@/actions/actions";

export default function Home() {
  const [auth, setAuth] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)

    if(result.success) {
      router.push('/home')
      setError("")
    } else {
      if(!result.success) {
        setError(result.message || "Something went wrong.")
      }
    }
  }

    async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const result = await signin(formData)

    if(result.success) {
      router.push('/home')
      setError("")
    } else {
      if(!result.success) {
        setError(result.message || "Something went wrong.")
      }
    }
  }

  return (
    <div className={styles.page}>
      <h1>TODO</h1>
      {auth ?
      <form onSubmit={handleSignin}>
        <div>
          <InputForm
            name="username"
            placeholder="Username"
            icon="solar:user-outline"
          />
          <InputForm
            name="password"
            placeholder="Password"
            icon="solar:key-minimalistic-outline"
          />
        </div>
        <div>
          <button type="submit">Sign in</button>
          <p>else</p>
          <button type="button">Discord</button>
          <p>{"Don't"} have an account? <button type="button" onClick={() => setAuth(false)} className='cursor-pointer'>Sign up</button></p>
        </div>
      </form> :
      <form onSubmit={handleSignup}>
        <div>
          <InputForm
            name="email"
            placeholder="Email"
            icon="line-md:email"
          />
          <InputForm
            name="username"
            placeholder="Username"
            icon="solar:user-outline"
          />
          <InputForm
            name="password"
            placeholder="Password"
            icon="solar:key-minimalistic-outline"
          />
        </div>
        <div>
          <button type="submit">Sign up</button>
          <p>else</p>
          <button type="button">Discord</button>
          <p>Already have an account? <button type="button" onClick={() => setAuth(true)} className='cursor-pointer'>Sign in</button></p>
        </div>
      </form>
      }

      {error && <p className="text-[tomato]">{error}</p>}
    </div>
  );
}
