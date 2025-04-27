import departments from "./departments.json";
import Fuse from 'fuse.js';

export type CourseRecord = {
  code: string;
  name: string;
  description: string;
  department: string;
  credits: { Amount: number };
  sections: SectionRecord[];
  gen_eds?: string[];
};

export type SectionRecord = {
  sec_code: string;
  instructors: string[],
  class_meetings: {
    InPerson?: { classtime: ClassTime, location: string[] },
    OnlineSync?: ClassTime
  }[]
}

export type ClassTime = {
  days: string;
  start_time: Time,
  end_time: Time
};

type Time = [hour: number, minute: number, kind: "Am" | "Pm"];

export const courses: CourseRecord[] = departments.flatMap((department) => department.courses.map((course) => ({
  ...course,
  department: department.name
})));

export const courseMap: Map<string, CourseRecord> = new Map(courses.map((course) => [course.code, course]));

export const courseFuse = new Fuse(courses, {
  keys: ["code", "name"],
  includeScore: false,
  shouldSort: true,
  isCaseSensitive: false,
  threshold: 0.3,
  ignoreLocation: true,
});
