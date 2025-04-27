'use client';
import { useScheduleState } from "../app/semester/store";
import { parseCommand } from "./gemini";
import { courseMap } from "../app/semester/courses";
import { courses } from "../app/semester/courses";
import type { CourseFilter } from "../app/semester/store";

type ExecuteResponse = {
  success: boolean;
  error?: string;
  affectedItems?: string[];
};

export function useAIActions() {
  const { removeCourse, updateCourseSections, addCourse, courseGroups } = useScheduleState();

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

            // Find all instances across groups (each group is a CourseFilter[])
          const groupsToUpdate: { groupIndex: number; courseIndex: number }[] = [];
          state.courseGroups.forEach((group, groupIndex) => {
            const courseIndex = group.courses.findIndex(cf =>
              cf.code.toUpperCase() === searchCode
            );
            if (courseIndex >= 0) {
              groupsToUpdate.push({ groupIndex, courseIndex });
            }
          });

          if (groupsToUpdate.length === 0) {
            throw new Error(`Course ${parameters.courseCode} not found. Available courses: ${state.courseGroups.flatMap(g => g.courses.map(c => c.code)).join(', ')
              }`);
          }

          // Remove from all groups containing it - using for...of
          for (const { groupIndex } of groupsToUpdate) {
            removeCourse(groupIndex, searchCode/*parameters.courseCode*/);
          }

          return {
            success: true,
            affectedItems: [`Removed ${/*parameters.courseCode*/searchCode} from ${groupsToUpdate.length} group(s)`]
          };
        }

        case "removeSection": {
          if (!parameters.sectionCode) throw new Error("No section specified");

          let found = false;
          for (const [groupIndex, group] of state.courseGroups.entries()) {
            for (const course of group.courses) {
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

        case "removeProfessor": {
          if (!parameters.professor) throw new Error("No professor specified");
          const prof = parameters.professor.trim().toLowerCase();

          let totalRemoved = 0;

          // Outer loop: each group with index
          for (const [gIdx, group] of state.courseGroups.entries()) {
            // Inner loop: each courseFilter in that group
            for (const cf of group.courses) {
              const record = courseMap.get(cf.code);
              if (!record) continue;
                // 2) allow partial (substring) matches on last name
            const keep = cf.sections.filter(secCode => {
                const rec = record.sections.find((s) => s.sec_code === secCode);
                if (!rec) return false;
                // drop any section where any instructor name includes prof
                return !rec.instructors.some((i) =>
                 i.toLowerCase().includes(prof)
               );
              });

              if (keep.length < cf.sections.length) {
                updateCourseSections(gIdx, cf.code, keep);
                totalRemoved += cf.sections.length - keep.length;
              }
            }
          }

          if (totalRemoved === 0) {
            throw new Error(
              `Professor "${parameters.professor}" not found on any section`
            );
          }

          affected.push(`Removed ${totalRemoved} section(s) taught by ${parameters.professor}`);
          break;
        }

        
        case "addProfessor": {
          if (!parameters.professor) throw new Error("No professor specified");
          // normalize (strip titles, lowercase)
          let prof = parameters.professor.trim().toLowerCase();
        
          let totalAdded = 0;
          const groups = state.courseGroups;
        
          // for each group…
          for (let gIdx = 0; gIdx < groups.length; gIdx++) {
            const group = groups[gIdx];
        
            // for each courseFilter in that group…
            for (const cf of group.courses) {
              const record = courseMap.get(cf.code);
              if (!record) continue;
        
              // find all section codes taught by this prof
              const taughtByProf = record.sections
                .filter(sec =>
                  sec.instructors.some(i => i.toLowerCase().includes(prof))
                )
                .map(sec => sec.sec_code);
        
              // only add those not already present
              const toAdd = taughtByProf.filter(secCode => !cf.sections.includes(secCode));
              if (toAdd.length > 0) {
                // merge old + new, preserving order
                const newSections = [...cf.sections, ...toAdd];
                updateCourseSections(gIdx, cf.code, newSections);
                totalAdded += toAdd.length;
              }
            }
          }
        
          if (totalAdded === 0) {
            throw new Error(`No sections found for Professor "${parameters.professor}" in your current schedule`);
          }
          affected.push(`Added ${totalAdded} section(s) taught by ${parameters.professor}`);
          break;
        }

        case "addCourse": {
          if (!parameters.courseCode) throw new Error("No course specified");
        
          // Look up the full course record
          const code = parameters.courseCode.toUpperCase().trim();

          // Find the CourseRecord by code in the courses array
          const record = courses.find(
            (c) => c.code.toUpperCase() === code
          );
          if (!record) {
            throw new Error(`Course ${code} not found in catalog`);
          }
          
        
          const sections = record.sections.map((s) => s.sec_code);
        addCourse({ code, sections }, 0);
        affected.push(`Added ${code} with ${sections.length} section(s)`);
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