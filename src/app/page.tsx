'use client'

import InputForm from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React, { lazy, Suspense, useState } from "react";
import styles from './page.module.scss';

const Modal = lazy(() => import('./Modal'))

export default function AuthPage() {
  const [auth, setAuth] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent<HTMLFormElement>, isSignIn: boolean) {
  e.preventDefault();
  setShowModal(true);
  setError("");

  try {
    const endpoint = isSignIn ? "/api/auth/signin" : "/api/auth/signup";

    const result = await fetch(endpoint, {
      method: "POST",
      body: new FormData(e.currentTarget),
      credentials: "include",
    }).then(res => res.json() as Promise<{ success: boolean; message?: string }>);

    if (result.success) {
      router.push("/home");
    } else {
      setError(result.message || "Something went wrong.");
      setShowModal(false);
    }
  } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError("Network error.");
    setShowModal(false);
  }
}


  const SignInFields = React.memo(function SignInFields() {
    return (
      <>
        <InputForm name="username" placeholder="Username" icon="solar:user-outline" />
        <InputForm name="password" placeholder="Password" icon="solar:key-minimalistic-outline" />
      </>
    )
  })

  return (
    <div className={styles.page}>
      <h1>TODO</h1>
      <form onSubmit={e => handleAuth(e, auth)}>
        <div>
          {!auth && (
            <InputForm name="email" placeholder="Email" icon="line-md:email" />
          )}
          <SignInFields />
        </div>
        <div>
          <button type="submit">{auth ? "Sign In" : "Sign Up"}</button>
          <p>or</p>
          <button type="button">Discord</button>
          <p>
            {auth ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setAuth(!auth)} className="cursor-pointer">
              {auth ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </form>

      {error && <p className="text-[tomato]">{error}</p>}

      {showModal && (
        <Suspense fallback={null}>
          <Modal visible={showModal} />
        </Suspense>
      )}
    </div>
  );
}