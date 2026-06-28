import { getGeminiClient } from "./_utils";

export default async function handler(req: any, res: any) {
  // Allow health check on GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  return res.status(200).json({
    status: "ok",
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
}
