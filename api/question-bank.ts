export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "working",
    domain: req.query?.domain || "none",
    questions: [
      { id: 1, text: "What is AWS EC2?" },
      { id: 2, text: "What is an S3 bucket?" }
    ]
  });
}