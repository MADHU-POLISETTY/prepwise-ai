import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

export default function ProfilePage() {

  const router = useRouter();
  const [email, setEmail] = useState("");

  const [totalInterviews, setTotalInterviews] =
    useState(0);

  const [averageScore, setAverageScore] =
    useState(0);
    

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) {
          router.push("/login");
          return;
        }

        setEmail(user.email || "");

        const querySnapshot = await getDocs(
          collection(db, "interviews")
        );

        let total = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {

          const data: any = doc.data();

          total += Number(data.score || 0);

          count++;
        });

        setTotalInterviews(count);

        if (count > 0) {
          setAverageScore(
            Math.round(total / count)
          );
        }
      }
    );

    return () => unsubscribe();

  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          User Profile
        </h1>

        <div className="bg-zinc-900 rounded-3xl p-8 mb-8">

          <h2 className="text-3xl font-bold mb-4">
            Email
          </h2>

          <p className="text-xl text-gray-300">
            {email}
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-zinc-900 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-4">
              Total Interviews
            </h2>

            <div className="text-5xl text-blue-400 font-bold">
              {totalInterviews}
            </div>

          </div>

          <div className="bg-zinc-900 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-4">
              Average Score
            </h2>

            <div className="text-5xl text-green-400 font-bold">
              {averageScore}%
            </div>

          </div>

        </div>

        <button
          onClick={async () => {

            await signOut(auth);

            router.push("/login");
          }}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl"
        >
          Logout
        </button>

      </div>

    </main>
  );
}