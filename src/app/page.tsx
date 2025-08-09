'use client'
import InputForm from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.scss';

export default function Home() {
  const [auth, setAuth] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  function handleParam(value: string) {
    const param = new URLSearchParams(searchParams.toString())
    param.set('auth', value)
    router.push(`/?${param.toString()}`)
  }

  useEffect(() => {
    const param = searchParams.get("auth")
    if(param === "signin") {
      setAuth(true)
    } else {
      setAuth(false)
    }
  }, [searchParams])

  return (
    <div className={styles.page}>
      <h1>TODO</h1>
      {auth ?
      <form action="">
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
          <button type="button" onClick={() => handleParam('signup')}>Sign up</button>
          <p>else</p>
          <button type="submit">Discord</button>
        </div>
      </form> :
      <form action="">
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
          <button type="button" onClick={() => handleParam('signin')}>Sign in</button>
          <p>else</p>
          <button type="submit">Discord</button>
        </div>
      </form>
      }
    </div>
  );
}
