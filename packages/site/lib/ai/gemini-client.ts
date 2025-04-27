import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function parseUserCommand(prompt: string, currentState: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent({
    contents: [{
      parts: [{
        text: `Convert this scheduling request to JSON. Current state: ${currentState}\n\nUser: "${prompt}"\n\nRespond ONLY with:\n{\n  "intent": "removeCourse" | "removeSection" | "blockTime",\n  "target": string,\n  "groupIndex"?: number\n}`
      }]
    }]
  });

  return JSON.parse(result.response.text());
}