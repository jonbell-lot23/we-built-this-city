"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/map");
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4 flex items-center justify-center">
      <div className="border border-green-400 p-4">
        <p>{">"} Loading city explorer...</p>
      </div>
    </main>
  );
}
