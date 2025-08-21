'use client'
import InputForm from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React, { lazy, Suspense, useState } from "react";
import styles from './page.module.scss';
import { signin, signup } from "@/actions/actions";

const Modal = lazy(() => import('./Modal'))

export default function Home() {
  const [auth, setAuth] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  async function handleAuth(
    e: React.FormEvent<HTMLFormElement>,
    action: (data: FormData) => Promise<{ success: boolean, message?: string }>
  ) {
    e.preventDefault();
    openModal();
    const result = await action(new FormData(e.currentTarget));
    if(result.success) router.push('/home');
    else setError(result.message || "Something went wrong.");
  }


  const openModal = () => {
    setShowModal(true)
  }

  const SignInFields = React.memo(() => (
    <>
      <InputForm name="username" placeholder="Username" icon="solar:user-outline" />
      <InputForm name="password" placeholder="Password" icon="solar:key-minimalistic-outline" />
    </>
  ))


  const action = auth ? signin : signup;

  return (
    <div className={styles.page}>
      <h1>TODO</h1>
      {auth ?
      <form onSubmit={e => handleAuth(e, action)}>
        <div>
          <SignInFields />
        </div>
        <div>
          <button type="submit">Sign in</button>
          <p>else</p>
          <button type="button">Discord</button>
          <p>{"Don't"} have an account? <button type="button" onClick={() => setAuth(false)} className='cursor-pointer'>Sign up</button></p>
        </div>
      </form> :
      <form onSubmit={e => handleAuth(e, action)}>
        <div>
          <InputForm
            name="email"
            placeholder="Email"
            icon="line-md:email"
          />
          <SignInFields />
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
      {showModal && (
        <Suspense fallback={null}>
          <Modal visible={showModal} />
        </Suspense>
      )}
    </div>
  );
}
