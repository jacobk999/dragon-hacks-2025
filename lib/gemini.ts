// /src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key (keep it here as requested) hh
const genAI = new GoogleGenerativeAI("AIzaSyAIHF5l2ffeYGQI6wQ6nH73c9UxYsKry6o");

type AIResponse = {
  intent: "removeCourse" | "removeSection";
  parameters: {
    courseCode?: string;
    sectionCode?: string;
  };
};

export async function parseCommand(prompt: string): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
    });

    console.log("Sending to Gemini:", prompt); // Debug log

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `[SYSTEM] Convert this scheduling command to JSON. Respond ONLY with the JSON object, no other text.
          
          USER INPUT: "${prompt}"
          VALID COMMANDS:
          - "remove [COURSE_CODE]" → {intent:"removeCourse", parameters:{courseCode:"COURSE_CODE"}}
          - "drop section [SECTION]" → {intent:"removeSection", parameters:{sectionCode:"SECTION"}}

          EXAMPLE: "Remove MATH140" → {"intent":"removeCourse","parameters":{"courseCode":"MATH140"}}`
        }]
      }]
    });

    const responseText = result.response.text();
    console.log("Raw Gemini Response:", responseText); // Debug log

    const parsed = JSON.parse(responseText.trim());
    console.log("Parsed Response:", parsed); // Debug log

    return parsed;

  } catch (error) {
    console.error("Full Error Details:", error); // Debug log
    throw new Error("Failed to process scheduling command. Please phrase it differently.");
  }
}