import { type ClassTime, courseMap } from "./courses";
import { type Day, days, type State, type Time } from "./store";

export type ScheduleTime = {
  day: Day;
  start: Time;
  end: Time
  location?: string;
};

export type ScheduleItem = {
  code: string;
  department: string;
  instructors: string[];
  section: string;
  times: ScheduleTime[];
}

export type Schedule = {
  courses: ScheduleItem[];
  credits: number;
}

export function createSchedules({
  timeBlocks = [],
  courseGroups,
  minCredits,
  maxCredits
}: State): Schedule[] {
  const sectionTimes = new Map<string, Interval[]>();

  for (const courseFilter of courseGroups.flatMap(({ courses }) => courses)) {
    const course = courseMap.get(courseFilter.code);
    if (!course) throw new Error(`Missing course: ${courseFilter.code}`);

    for (const section of course.sections) {
      if (!courseFilter.sections.includes(section.sec_code)) continue;

      const times = [];

      for (const meeting of section.class_meetings) {
        if (meeting.InPerson) {
          times.push(...classTimeToIntervals(meeting.InPerson.classtime));
        } else if (meeting.OnlineSync) {
          times.push(...classTimeToIntervals(meeting.OnlineSync));
        }
      }

      sectionTimes.set(`${course.code}-${section.sec_code}`, times);
    }
  }

  const blockedTimes: Interval[] = timeBlocks.flatMap((block) => block.days.map((day) => {
    const dayIndex = days.indexOf(day);
    const dayOffset = dayIndex * 24 * 60;

    return {
      start: timeToMinutes(block.start) + dayOffset,
      end: timeToMinutes(block.end) + dayOffset,
    }
  }));

  function isValidSchedule(schedule: Pick<ScheduleItem, "code" | "section">[]) {
    const times = schedule.flatMap((course) => sectionTimes.get(`${course.code}-${course.section}`)!).concat(blockedTimes);

    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        const intervalA = times[i];
        const intervalB = times[j];

        if (intervalA.end < intervalB.start || intervalA.start > intervalB.end) continue;

        return false;
      }
    }

    return true;
  }

  const validSchedules: Schedule[] = [];

  function backtrack(schedule: ScheduleItem[], courseIndex: number, credits: number) {
    if ((maxCredits !== 0 && credits > maxCredits) || !isValidSchedule(schedule)) return;

    if (courseIndex >= courseGroups.length) {
      if (credits < minCredits) return;

      validSchedules.push({ credits, courses: [...schedule] });
      return;
    }

    for (const courseFilter of courseGroups[courseIndex].courses) {
      for (const selectedSection of courseFilter.sections) {
        const course = courseMap.get(courseFilter.code)!;
        const section = course?.sections.find((section) => section.sec_code === selectedSection)!;

        schedule.push({
          code: courseFilter.code,
          section: section.sec_code,
          instructors: section.instructors,
          department: course.department,
          times: section.class_meetings.flatMap((meeting) => {
            if (meeting.InPerson) {
              return classTimeToTimeArray(meeting.InPerson.classtime, meeting.InPerson.location ? meeting.InPerson.location.join("") : "N/A");
            } else if (meeting.OnlineSync) {
              return classTimeToTimeArray(meeting.OnlineSync);
            } else {
              return [];
            }
          })
        });

        backtrack(schedule, courseIndex + 1, credits + course.credits.Amount);

        schedule.pop();
      }
    }
  }

  backtrack([], 0, 0);

  // Sorts by average day length
  validSchedules.sort((a, b) => {
    function totalDayLength(schedule: Schedule): number {
      const dayMap = new Map<Day, { start: number; end: number }>();

      for (const course of schedule.courses) {
        for (const time of course.times) {
          const minutesStart = timeToMinutes(time.start);
          const minutesEnd = timeToMinutes(time.end);

          const entry = dayMap.get(time.day);
          if (entry) {
            entry.start = Math.min(entry.start, minutesStart);
            entry.end = Math.max(entry.end, minutesEnd);
          } else {
            dayMap.set(time.day, { start: minutesStart, end: minutesEnd });
          }
        }
      }

      let total = 0;
      for (const { start, end } of dayMap.values()) {
        total += (end - start);
      }

      return total;
    }

    return totalDayLength(a) - totalDayLength(b);
  });

  return validSchedules;
}

type Interval = { start: number; end: number; }

export function timeToMinutes(time: Time) {
  const minutes = time[1];
  let hours = 0;

  if (time[2] === "Pm" && time[0] !== 12) {
    hours = time[0] + 12;
  } else {
    hours = time[0];
  }

  return (hours * 60) + minutes;
}

function classTimeToIntervals(classTime: ClassTime): Interval[] {
  const dayCodes = classTime.days.split("");
  const days = [];

  for (let i = 0; i < dayCodes.length; i++) {
    if (dayCodes[i] === "M") days.push(0);
    else if (dayCodes[i] === "T") {
      if (dayCodes[i + 1] === "u") days.push(1);
      else days.push(3);
      i++;
    }
    else if (dayCodes[i] === "W") days.push(2);
    else if (dayCodes[i] === "F") days.push(4);
  }

  const start = timeToMinutes(classTime.start_time);
  const end = timeToMinutes(classTime.end_time);

  return days.map((day) => ({
    start: start + (day * 24 * 60),
    end: end + (day * 24 * 60)
  }))
}

function classTimeToTimeArray(classTime: ClassTime, location?: string): ScheduleTime[] {
  const dayCodes = classTime.days.split("");
  const classDays = [];

  for (let i = 0; i < dayCodes.length; i++) {
    if (dayCodes[i] === "M") classDays.push(0);
    else if (dayCodes[i] === "T") {
      if (dayCodes[i + 1] === "u") classDays.push(1);
      else classDays.push(3);
      i++;
    }
    else if (dayCodes[i] === "W") classDays.push(2);
    else if (dayCodes[i] === "F") classDays.push(4);
  }

  return classDays.map((day) => ({
    day: days[day],
    location,
    start: classTime.start_time,
    end: classTime.end_time
  }))
}