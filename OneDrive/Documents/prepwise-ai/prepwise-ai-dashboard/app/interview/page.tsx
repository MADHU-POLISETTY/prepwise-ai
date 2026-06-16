"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function InterviewPage() {
  const router = useRouter();
  const hrQuestions = [

  "Tell me about yourself",

  "Why should we hire you?",

  "What are your strengths?",

  "Describe a challenge you faced",

];

const technicalQuestions = [

  "Explain React lifecycle",

  "What is Firebase?",

  "Difference between SQL and NoSQL",

  "Explain API integration",

];

const aptitudeQuestions = [

  "What is probability?",

  "Explain percentage calculation",

  "What is time complexity?",

  "Solve a logical reasoning problem",

];

const allQuestions = [

  ...hrQuestions,

  ...technicalQuestions,

  ...aptitudeQuestions,

];

const questions = allQuestions
  .sort(() => 0.5 - Math.random())
  .slice(0, 4);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Microphone
 const startListening = async () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported");
    return;
  }

  try {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestion] = transcript;

      setAnswers(updatedAnswers);
    };

    recognition.onerror = (event: any) => {
      console.log(event.error);
      alert(event.error);
    };

  } catch (err) {
    console.log(err);
  }
};

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            AI Interview Session
          </h1>

          <div className="bg-red-600 px-4 py-2 rounded-xl">
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        <div className="bg-zinc-900 p-8 rounded-3xl">

          <p className="mb-4 text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>

          <h2 className="text-3xl font-bold mb-8">
            {questions[currentQuestion]}
          </h2>

          <textarea
            value={answers[currentQuestion]}
            onChange={(e) => {
              const updatedAnswers = [...answers];
              updatedAnswers[currentQuestion] = e.target.value;
              setAnswers(updatedAnswers);
            }}
            className="w-full h-48 bg-zinc-800 rounded-2xl p-4"
          />

          <button
            onClick={startListening}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-2xl"
          >
            🎤 Start Speaking
          </button>

          <div className="flex justify-between mt-8">

            <button
              disabled={currentQuestion === 0}
              onClick={() =>
                setCurrentQuestion((prev) => prev - 1)
              }
              className="bg-zinc-700 px-6 py-3 rounded-2xl"
            >
              Previous
            </button>

            <button
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion((prev) => prev + 1);
                } else {
                  let score = 0;

answers.forEach((answer) => {

  if (answer.length > 20) {
    score += 25;
  }

  if (
    answer.toLowerCase().includes("project")
  ) {
    score += 5;
  }

  if (
    answer.toLowerCase().includes("team")
  ) {
    score += 5;
  }

  if (
    answer.toLowerCase().includes("experience")
  ) {
    score += 5;
  }

});

if (score > 100) {
  score = 100;
}
localStorage.setItem(
  "interviewScore",
  score.toString()
);
                 router.push("/results");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl"
            >
              {currentQuestion === questions.length - 1
                ? "Submit Interview"
                : "Next Question"}
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}