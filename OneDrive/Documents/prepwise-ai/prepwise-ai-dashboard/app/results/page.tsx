"use client";
import jsPDF from "jspdf";
export default function ResultsPage() {

  const score =
  Number(localStorage.getItem("interviewScore")) || 0;
  let feedback = "";

if (score >= 80) {

  feedback =
    "Excellent performance. You demonstrated strong communication and confidence.";

} else if (score >= 50) {

  feedback =
    "Good attempt. Try improving technical explanations and confidence.";

} else {

  feedback =
    "Needs improvement. Try giving longer and more detailed answers.";
}
const downloadPDF = () => {

  const doc = new jsPDF();

  doc.setFontSize(22);

  doc.text(
    "AI Interview Report",
    20,
    20
  );

  doc.setFontSize(16);

  doc.text(
    `Score: ${score}%`,
    20,
    50
  );

  doc.text(
    `Feedback: ${feedback}`,
    20,
    80
  );

  doc.save("Interview_Report.pdf");
};
  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Interview Results
        </h1>

        <div className="bg-zinc-900 rounded-3xl p-8 mb-8">

          <h2 className="text-3xl font-bold mb-4">
            Overall Score
          </h2>

          <div className="text-6xl font-bold text-green-500">
            {score}%
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-zinc-900 rounded-3xl p-6">
            <h3 className="text-2xl font-bold mb-3">
              Communication
            </h3>

            <p className="text-green-400 text-3xl">
              8/10
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6">
            <h3 className="text-2xl font-bold mb-3">
              Technical Skills
            </h3>

            <p className="text-yellow-400 text-3xl">
              7/10
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6">
            <h3 className="text-2xl font-bold mb-3">
              Confidence
            </h3>

            <p className="text-blue-400 text-3xl">
              9/10
            </p>
          </div>

        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 mt-8">

          <h2 className="text-3xl font-bold mb-4">
            AI Feedback
          </h2>
          
<button
  onClick={downloadPDF}
  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl mb-8"
>
  Download Report
</button>
          <p className="text-gray-300 text-xl leading-10">
  {feedback}
</p>

        </div>

      </div>

    </main>
    
  );
}