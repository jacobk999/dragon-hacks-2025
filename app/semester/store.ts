import { create } from "zustand";

export const days = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

export type Day = typeof days[number];

export type Time = [hour: number, minute: number, kind: "Am" | "Pm"];

export type TimeBlock = {
  id: string;
  days: Day[];
  start: Time;
  end: Time;
}

export type CourseFilter = {
  code: string;
  sections: string[];
};

export type CourseGroup = {
  id: string;
  courses: CourseFilter[];
}

export interface State {
  timeBlocks: TimeBlock[];
  courseGroups: CourseGroup[];

  minCredits: number;
  maxCredits: number;
}

type Action = {
  addCourse: (course: CourseFilter, group: number) => void;
  removeCourse: (groupIndex: number, courseCode: string) => void;

  updateMinCredits: (minCredits: State["minCredits"]) => void;
  updateMaxCredits: (maxCredits: State["maxCredits"]) => void;

  addTimeBlock: (tb: Omit<TimeBlock, "id">) => void;
  updateTimeBlock: (idx: number, tb: TimeBlock) => void;
  removeTimeBlock: (idx: number) => void;

  updateCourseSections: (
    groupIndex: number,
    courseCode: string,
    sections: string[]
  ) => void;
  // note to self

}

const randomId = () => {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
};

export const useScheduleState = create<State & Action>((set) => ({
  timeBlocks: [],
  addTimeBlock: (tb) => set((s) => ({ timeBlocks: [...s.timeBlocks, { ...tb, id: randomId() }] })),

  updateTimeBlock: (idx, tb) =>
    set((s) => {
      const copy = [...s.timeBlocks];
      copy[idx] = tb;
      return { timeBlocks: copy };
    }),

  removeTimeBlock: (idx) =>
    set((s) => {
      const copy = [...s.timeBlocks];
      copy.splice(idx, 1);
      return { timeBlocks: copy };
    }),

  updateCourseSections: (groupIndex, code, sections) =>
    set((s) => {
      const groups = [...s.courseGroups];
      const group = groups[groupIndex].courses.map((cf) =>
        cf.code === code ? { ...cf, sections } : cf
      );
      groups[groupIndex].courses = group;
      return { courseGroups: groups };
    }),



  courseGroups: [],

  minCredits: 1,
  maxCredits: 0,

  addCourse: (course, group) => set(({ courseGroups }) => {
    const copy = [...courseGroups];
    const id = randomId();

    if (group >= copy.length) {
      copy.push({ id, courses: [course] });
    } else {
      copy[group].courses.push(course);
    }

    return { courseGroups: copy }
  }),

  removeCourse: (groupIndex, code) =>
    set((s) => {
      const groups = [...s.courseGroups];
      groups[groupIndex].courses = groups[groupIndex].courses.filter((cf) => cf.code !== code);
      if (groups[groupIndex].courses.length === 0) groups.splice(groupIndex, 1);
      return { courseGroups: groups };
    }),

  updateMinCredits: (minCredits) => set(() => ({ minCredits })),
  updateMaxCredits: (maxCredits) => set(() => ({ maxCredits })),
}))

