import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY!);

type AIResponse = {
  intent: "removeCourse" | "removeSection" | "filterProfessor" | "addTimeBlock";
  parameters: {
    courseCode?: string;
    sectionCode?: string;
    professor?: string;
    timeRange?: "morning" | "afternoon" | "evening";
  };
};

export async function parseCommand(prompt: string): Promise<AIResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const result = await model.generateContent(`
    Convert this scheduling command to JSON:

    USER INPUT: "${prompt}"

    RULES:
    - "remove [COURSE]": removeCourse (e.g. "CMSC131")
    - "drop section [NUM]": removeSection (e.g. "0101")
    - "no [PROFESSOR]": filterProfessor (e.g. "Dr. Smith")
    - "only [TIME] classes": addTimeBlock (e.g. "morning")

    Respond STRICTLY in this JSON format:
    {
      "intent": string,
      "parameters": {
        "courseCode"?: string,
        "sectionCode"?: string,
        "professor"?: string,
        "timeRange"?: string
      }
    }
  `);

  const text = result.response.text();
  return JSON.parse(text.trim());
}