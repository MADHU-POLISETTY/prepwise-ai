import {
  getGeminiClient,
  getSimulatedAskMS
} from "./_utils.ts";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { messages = [] } = req.body;

  const client = getGeminiClient();
  const lastUserMsg = messages[messages.length - 1]?.text || "";

  if (!client) {
    console.warn("Ask MS AI endpoint: Gemini client missing, using local simulated chat assistant.");
    return res.status(200).json({ text: getSimulatedAskMS(lastUserMsg) });
  }

  try {
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are 'Ask MS' (Mentor & Support), the primary professional AI coach at PrepWise AI. Answer candidate questions about career growth, interview preparation strategies (STAR method, system design approaches, behaviorals), and resume details. Maintain a premium, minimal, focused tone of a senior lead from Stripe, Notion, Linear, or OpenAI. Keep responses under 3 paragraphs with generous whitespace (Markdown bullet points are preferred) and avoid conversational filler or meta-references. Be encouraging, precise, and highly practical.",
      }
    });

    const replyText = response.text;
    if (!replyText) {
      throw new Error("No response text returned from Gemini API");
    }

    return res.status(200).json({ text: replyText });
  } catch (err: any) {
    console.warn("Ask MS AI endpoint failed, falling back to simulated chat assistant:", err);
    return res.status(200).json({ text: getSimulatedAskMS(lastUserMsg) });
  }
}
