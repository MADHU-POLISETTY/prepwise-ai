process.noDeprecation = true;
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Import Vercel API handlers directly so there is absolutely NO discrepancy or code duplication!
import healthHandler from "./api/_handlers/health.js";
import generateQuestionsHandler from "./api/_handlers/generate-questions.js";
import questionBankHandler from "./api/_handlers/question-bank.js";
import evaluateAnswerHandler from "./api/_handlers/evaluate-answer.js";
import evaluateInterviewHandler from "./api/_handlers/evaluate-interview.js";
import analyzeResumeHandler from "./api/_handlers/analyze-resume.js";
import askMsHandler from "./api/_handlers/ask-ms.js";

dotenv.config();

console.log("Gemini API Key exists:", !!process.env.GEMINI_API_KEY);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Route all standard /api/ endpoints to their official standalone handler files
app.all("/api/health", healthHandler);
app.all("/api/generate-questions", generateQuestionsHandler);
app.all("/api/question-bank", questionBankHandler);
app.all("/api/evaluate-answer", evaluateAnswerHandler);
app.all("/api/evaluate-interview", evaluateInterviewHandler);
app.all("/api/analyze-resume", analyzeResumeHandler);
app.all("/api/ask-ms", askMsHandler);

// ----------------------------------------------------
// INTEGRATE VITE DEVELOPMENT MIDDLEWARE OR STATIC SERVER
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PrepWise AI Backend] Server successfully running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
