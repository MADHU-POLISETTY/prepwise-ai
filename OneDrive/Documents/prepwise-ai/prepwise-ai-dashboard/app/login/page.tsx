"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/firebase/config";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account Created");

    } catch (error: any) {

      alert(error.message);
    }
  };

  const login = async () => {

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful");

   const router = useRouter();

    } catch (error: any) {

      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">

      <div className="bg-zinc-900 rounded-3xl p-10 w-full max-w-md">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-2xl mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-2xl mb-6 outline-none"
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl mb-4"
        >
          Login
        </button>

        <button
          onClick={register}
          className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded-2xl"
        >
          Register
        </button>

      </div>

    </main>
  );
}