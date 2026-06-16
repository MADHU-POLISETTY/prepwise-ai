"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/firebase/config";

export default function AuthGuard({
    
  children,
}: any) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {

        if (!user) {

  setLoading(false);

  router.push("/login");

} else {

  setLoading(false);
}
      }
    );

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return children;
}