export default function LandingPage() {

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-8 py-32">

        <h1 className="text-7xl font-bold mb-8">
          PrepWise AI
        </h1>

        <p className="text-2xl text-gray-400 max-w-3xl mb-10">

          AI-Powered Interview Preparation Platform
          for students and job seekers.

        </p>

        <div className="flex gap-6">

          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-xl"
          >
            Get Started
          </a>

          <a
            href="/"
            className="bg-zinc-800 hover:bg-zinc-700 px-8 py-4 rounded-2xl text-xl"
          >
            Dashboard
          </a>

        </div>

      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-32">

        <h2 className="text-5xl font-bold text-center mb-16">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h3 className="text-3xl font-bold mb-4">
              AI Interviews
            </h3>

            <p className="text-gray-400">
              Practice HR and technical interviews
              with AI-based evaluation.
            </p>

          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h3 className="text-3xl font-bold mb-4">
              Resume Analysis
            </h3>

            <p className="text-gray-400">
              Upload resumes and get intelligent
              skill analysis.
            </p>

          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl">

            <h3 className="text-3xl font-bold mb-4">
              Analytics Dashboard
            </h3>

            <p className="text-gray-400">
              Track interview performance using
              charts and reports.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}