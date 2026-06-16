"use client";

import { useState } from "react";

export default function ResumePage() {

  const [fileName, setFileName] =
    useState("");
    const [analysis, setAnalysis] =
  useState("");

  const handleFile = (e: any) => {

  const file = e.target.files[0];

  if (file) {

    setFileName(file.name);

    localStorage.setItem(
      "resumeName",
      file.name
    );

    const lowerName =
      file.name.toLowerCase();

    let feedback =
      "Good resume uploaded.";

    if (
      lowerName.includes("ai") ||
      lowerName.includes("ml")
    ) {

      feedback =
        "Strong AI/ML profile detected.";
    }

    if (
      lowerName.includes("java")
    ) {

      feedback +=
        " Java skill detected.";
    }

    if (
      lowerName.includes("python")
    ) {

      feedback +=
        " Python skill detected.";
    }

    setAnalysis(feedback);
  }
};;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">

      <div className="bg-zinc-900 p-10 rounded-3xl w-full max-w-xl">

        <h1 className="text-4xl font-bold mb-8">
          Upload Resume
        </h1>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFile}
          className="mb-6"
        />

        {fileName && (

         <div className="bg-zinc-800 p-4 rounded-2xl mt-4">

  <h2 className="text-2xl font-bold mb-3">
    AI Resume Analysis
  </h2>

  <p className="text-gray-300">
    {analysis}
  </p>

</div>

        )}

      </div>

    </main>
  );
}
