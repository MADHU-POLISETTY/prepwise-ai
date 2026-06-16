"use client";
import AuthGuard from "./AuthGuard";
import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "@/firebase/config";

export default function Home() {

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {

        if (user) {
          setUserEmail(user.email || "");
        }
      }
    );

    return () => unsubscribe();

  }, []);

  return (
  <AuthGuard>
    <main className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-zinc-950 p-6 border-r border-zinc-800">

        <h1 className="text-4xl font-bold text-blue-500 mb-10">
          PrepWise AI
        </h1>

        <nav className="space-y-6 text-xl">

          <a
            href="/"
            className="block hover:text-blue-400"
          >
            Dashboard
          </a>

          <a
            href="/interview"
            className="block hover:text-blue-400"
          >
            Practice
          </a>

          <a
            href="/results"
            className="block hover:text-blue-400"
          >
            Results
          </a>

          <a
            href="/history"
            className="block hover:text-blue-400"
          >
            History
          </a>

          <a
            href="/profile"
            className="block hover:text-blue-400"
          >
            Profile
          </a>

        </nav>

      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6">

        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold">
              Welcome {userEmail} 👋
            </h1>

            <p className="text-gray-400 mt-2">
              AI-Powered Interview Preparation Platform
            </p>

          </div>

          <button
            onClick={async () => {

              await signOut(auth);

              window.location.href = "/login";
            }}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl"
          >
            Logout
          </button>

        </div>

        {/* Interview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* HR */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-blue-500 transition">

            <h2 className="text-2xl font-semibold mb-3">
              HR Interview
            </h2>

            <p className="text-gray-400 mb-5">
              Practice HR interview questions
            </p>

            <a
              href="/interview"
              className="bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition inline-block"
            >
              Start
            </a>

          </div>

          {/* Technical */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-purple-500 transition">

            <h2 className="text-2xl font-semibold mb-3">
              Technical Interview
            </h2>

            <p className="text-gray-400 mb-5">
              Improve technical interview skills
            </p>

            <a
              href="/interview"
              className="bg-purple-600 px-4 py-2 rounded-xl hover:bg-purple-700 transition inline-block"
            >
              Start
            </a>

          </div>

          {/* Communication */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-cyan-500 transition">

            <h2 className="text-2xl font-semibold mb-3">
              Communication Skills
            </h2>

            <p className="text-gray-400 mb-5">
              Enhance speaking confidence
            </p>

            <a
              href="/interview"
              className="bg-cyan-600 px-4 py-2 rounded-xl hover:bg-cyan-700 transition inline-block"
            >
              Start
            </a>

          </div>

          {/* Aptitude */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 hover:border-pink-500 transition">

            <h2 className="text-2xl font-semibold mb-3">
              Aptitude Round
            </h2>

            <p className="text-gray-400 mb-5">
              Practice aptitude questions
            </p>

            <a
              href="/interview"
              className="bg-pink-600 px-4 py-2 rounded-xl hover:bg-pink-700 transition inline-block"
            >
              Start
            </a>

          </div>

        </div>

      </section>

   </main>
</AuthGuard>
  );
}