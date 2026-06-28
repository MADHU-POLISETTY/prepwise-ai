import { getQuestionBankPool } from "./_utils.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Handle parameters from query (GET) or body (POST) to be extremely resilient
  const domain = req.query?.domain || req.body?.domain || "Technical";
  const customTopic = req.query?.customTopic || req.body?.customTopic || "";

  const actualDomain = String(domain);
  const actualCustomTopic = String(customTopic);

  const pool = getQuestionBankPool(actualDomain, "Software Engineer", "Medium", "Standard", actualCustomTopic);
  
  console.log("Question bank called:", actualDomain);
  return res.status(200).json({
    domain: actualDomain,
    questions: pool.map((text, idx) => ({ id: idx + 1, text }))
  });
}
