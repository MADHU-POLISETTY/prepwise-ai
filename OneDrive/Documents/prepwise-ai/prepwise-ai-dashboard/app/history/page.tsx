"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export default function HistoryPage() {

  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {

    const querySnapshot = await getDocs(
      collection(db, "interviews")
    );

    const data: any[] = [];

    querySnapshot.forEach((docItem) => {
      data.push({
        id: docItem.id,
        ...docItem.data(),
      });
    });

    setInterviews(data);
  };

  const deleteInterview = async (id: string) => {

    await deleteDoc(doc(db, "interviews", id));

    fetchInterviews();
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Interview History
        </h1>

        <div className="space-y-6">

          {interviews.map((item, index) => (

            <div
              key={index}
              className="bg-zinc-900 rounded-3xl p-6"
            >

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-2xl font-bold">
                  Interview #{index + 1}
                </h2>

                <div className="flex gap-4 items-center">

                  <div className="text-green-400 text-2xl font-bold">
                    {item.score}%
                  </div>

                  <button
                    onClick={() => deleteInterview(item.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
                  >
                  <a
  href={`/history/${item.id}`}
  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
>
  View
</a>
                    Delete
                  </button>

                </div>

              </div>

              <p className="text-gray-400 mb-4">
                {item.completedAt}
              </p>

              <div className="space-y-2">

                {item.answers?.map(
                  (answer: string, i: number) => (

                    <div
                      key={i}
                      className="bg-zinc-800 p-3 rounded-xl"
                    >
                      {answer}
                    </div>
                  )
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}