'use client';
import { useScheduleState } from "../app/semester/store";
import { parseCommand } from "./gemini";

type ExecuteResponse = {
  success: boolean;
  error?: string;
  affectedItems?: string[];
};

export function useAIActions() {
  const { removeCourse, updateCourseSections } = useScheduleState();

  const execute = async (prompt: string): Promise<ExecuteResponse> => {
    try {
      console.log("AI Command:", prompt);
      const { intent, parameters } = await parseCommand(prompt);

      const state = useScheduleState.getState();
      if (!state.courseGroups) {
        throw new Error("No courses available to modify");
      }

      const affected: string[] = [];

      switch (intent) {
        case "removeCourse": {
          if (!parameters.courseCode) throw new Error("No course specified");

          const state = useScheduleState.getState();
          const searchCode = parameters.courseCode.toUpperCase().trim();

          // Find all instances across groups
          const groupsToUpdate: Array<{ groupIndex: number, courseIndex: number }> = [];
          for (const [groupIndex, group] of state.courseGroups.entries()) {
            const courseIndex = group.findIndex(c => c.code.toUpperCase() === searchCode);
            if (courseIndex >= 0) {
              groupsToUpdate.push({ groupIndex, courseIndex });
            }
          }

          if (groupsToUpdate.length === 0) {
            throw new Error(`Course ${parameters.courseCode} not found. Available courses: ${state.courseGroups.flatMap(g => g.map(c => c.code)).join(', ')
              }`);
          }

          // Remove from all groups containing it - using for...of
          for (const { groupIndex } of groupsToUpdate) {
            removeCourse(groupIndex, parameters.courseCode);
          }

          return {
            success: true,
            affectedItems: [`Removed ${parameters.courseCode} from ${groupsToUpdate.length} group(s)`]
          };
        }

        case "removeSection": {
          if (!parameters.sectionCode) throw new Error("No section specified");

          let found = false;
          for (const [groupIndex, group] of state.courseGroups.entries()) {
            for (const course of group) {
              if (course.sections.includes(parameters.sectionCode)) {
                updateCourseSections(
                  groupIndex,
                  course.code,
                  course.sections.filter(s => s !== parameters.sectionCode)
                );
                found = true;
                affected.push(`Section ${parameters.sectionCode} in ${course.code}`);
              }
            }
          }

          if (!found) throw new Error(`Section ${parameters.sectionCode} not found in any course`);
          break;
        }

        default:
          throw new Error(`Unsupported command: ${intent}`);
      }

      return {
        success: true,
        affectedItems: affected
      };

    } catch (error) {
      console.error("AI Action Failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };

  return { execute };
}