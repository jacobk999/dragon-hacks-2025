'use client';
import { useScheduleState } from "@/store";
import { parseCommand } from "./gemini";

export function useAIActions() {
  const { removeCourse, updateCourseSections, addTimeBlock } = useScheduleState();

  const execute = async (prompt: string) => {
    try {
      const { intent, parameters } = await parseCommand(prompt);
      
      switch (intent) {
        case "removeCourse":
          if (!parameters.courseCode) throw new Error("No course specified");
          removeCourse(0, parameters.courseCode); // Default to group 0
          break;
          
        case "removeSection":
          if (!parameters.sectionCode) throw new Error("No section specified");
          const state = useScheduleState.getState();
          state.courseGroups.forEach((group, groupIndex) => {
            group.forEach(course => {
              if (course.sections.includes(parameters.sectionCode!)) {
                updateCourseSections(
                  groupIndex,
                  course.code,
                  course.sections.filter(s => s !== parameters.sectionCode)
                );
              }
            });
          });
          break;
          
        // Add other intents...
      }
      
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  };

  return { execute };
}