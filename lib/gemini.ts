// /src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key (keep it here as requested) hh
const genAI = new GoogleGenerativeAI("AIzaSyAIHF5l2ffeYGQI6wQ6nH73c9UxYsKry6o");

type AIResponse = {
  intent: "removeCourse" | "removeSection" | "removeProfessor" | "addCourse" | "addSection" | "addProfessor";
  parameters: {
    courseCode?: string;
    sectionCode?: string;
    professor?: string;
  };
};

export async function parseCommand(prompt: string): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Works perfect as of now, Change to gemini-2.0-flash-001 if error, more stable ver.
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
          - "no [COURSE_CODE]" → {intent:"removeCourse", parameters:{courseCode:"COURSE_CODE"}}
          - "drop section [SECTION]" → {intent:"removeSection", parameters:{sectionCode:"SECTION"}}
          - "remove [NAME]"     → {intent:"removeProfessor",   parameters:{professor:"NAME"}}
          - "remove professor [NAME]"     → {intent:"removeProfessor",   parameters:{professor:"NAME"}}
          - "no [NAME]"     → {intent:"removeProfessor",   parameters:{professor:"NAME"}}
          - "i don't want [NAME]"     → {intent:"removeProfessor",   parameters:{professor:"NAME"}}
          - "i don't want [COURSE_CODE]" → {intent:"removeCourse", parameters:{courseCode:"COURSE_CODE"}}

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