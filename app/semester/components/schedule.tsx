import { cn } from "~/lib/util";
import { timeToMinutes, type ScheduleItem, type Schedule as ScheduleRecord, type ScheduleTime } from "../scheduler";
import type { CSSProperties } from "react";
import { days } from "../store";
import { motion } from "motion/react";

export function Schedule({ schedule }: { schedule: ScheduleRecord }) {
  if (!schedule.courses.length) return <div>Hhh</div>;

  let minTime = 1440;
  let maxTime = 0;

  for (const course of schedule.courses) {
    for (const time of course.times) {
      minTime = Math.min(minTime, timeToMinutes(time.start));
      maxTime = Math.max(maxTime, timeToMinutes(time.end));
    }
  }

  minTime = Math.floor(minTime / 60) * 60;
  maxTime = Math.ceil(maxTime / 60) * 60;

  if (maxTime - minTime < 240) {
    maxTime = minTime + 204;
  }

  const HEIGHT = 600;
  const minuteHeight = HEIGHT / (maxTime - minTime);

  const startTime = minTime / 60;
  const endTime = (maxTime / 60) + 1;
  const timeRange = Array.from({ length: endTime - startTime }, (_, index) => startTime + index);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout className="flex flex-col p-2 gap-2 relative bg-slate-400/10 rounded-2xl">
      <div className="absolute inset-0 bg-glass rounded-2xl" />
      <div className="text-slate-400 text-center font-semibold text-lg"><p>{schedule.credits} credits</p></div>
      <div className="w-full h-px bg-slate-300 my-1" />
      <div className="pl-16 grid grid-cols-5 gap-2 text-slate-500">
        <p className="col-start-1">Mon</p>
        <p className="col-start-2">Tues</p>
        <p className="col-start-3">Wed</p>
        <p className="col-start-4">Thurs</p>
        <p className="col-start-5">Fri</p>
      </div>
      <div className="pl-16 grid grid-cols-5 gap-2 h-150 relative overflow-hidden">
        <div className="absolute h-full w-16 text-slate-500">
          {timeRange.map((time) => (
            <p
              key={time}
              className="absolute"
              style={{
                top: `${(time - startTime) * 60 * minuteHeight}px`,
              }}
            >
              {time === 12 ? 12 : time % 12} {time > 12 ? "PM" : "AM"}
            </p>
          ))}
        </div>
        {timeRange.map((time) => (
          <div
            key={time}
            className="absolute w-full h-px bg-slate-100/70"
            style={{ top: `${(time - startTime) * 60 * minuteHeight}px` }}
          />
        ))}
        {schedule.courses.map((course) => course.times.map((time, index) => {
          const start = timeToMinutes(time.start);
          const end = timeToMinutes(time.end);
          const column = days.indexOf(time.day) + 1;

          return (
            <div key={`${course.code}-${time.day}-${index}`} className="relative row-start-1" style={{ gridColumnStart: column }}>
              <CourseCard
                className="absolute w-full"
                course={course}
                time={time}
                style={{
                  top: `${(start - minTime) * minuteHeight}px`,
                  height: `${(end - start) * minuteHeight}px`
                }}
              />
            </div>
          );
        }))}
      </div>
    </motion.div>
  )
}


/* ---------- colors.ts ---------- */
export const CourseColors: string[] = [
  "#FF6B6B", // vivid coral
  "#FF8E72", // salmon
  "#FFA94D", // mango
  "#FFD166", // sunflower
  "#FFE084", // pale gold
  "#F8F99A", // banana cream
  "#D4F88F", // lime sherbet
  "#9BE28A", // mint
  "#6FD6A2", // seafoam
  "#4EC7B5", // aqua
  "#3CBAC4", // robin-egg blue
  "#2BAFD4", // sky
  "#24A0E3", // azure
  "#2D8CFF", // royal blue
  "#5A7AFF", // indigo
  "#7A6CFF", // periwinkle
  "#9573FF", // lavender
  "#B284FF", // heliotrope
  "#C88BFA", // light orchid
  "#DB92E7", // thistle
  "#E89BD1", // dusty pink
  "#F2A3BB", // rose
  "#FFB1A8", // melon
  "#FFBFA1", // peach
  "#FFCFA1", // creamsicle
  "#D8D99B", // sage
  "#B9D89B", // pistachio
  "#9AD5A7", // pale jade
  "#7CCFBC", // turquoise tint
  "#63C8CD", // glacier
  "#50BDDA", // ice
  "#4DAFDC", // pool
  "#52A1D8", // denim
  "#6594D4", // cornflower
  "#7A88CF", // twilight
  "#8C7CC8", // amethyst
  "#9C72BE", // lilac
  "#AA6AB1", // wisteria
  "#B766A4", // mauve
  "#C66C97", // dusty rose
  "#D6758A", // coral blush
  "#E5827E", // flamingo
  "#F39275", // apricot
  "#FF9F74", // papaya
  "#FFAD7B", // cantaloupe
  "#FFBC8B", // buttercup
  "#FFC89F", // light apricot
  "#FFD4B4", // pastel orange
  "#FFE0C9", // porcelain
  "#F8F5F2"  // near-white
];

// Randomization of color based on num
export function colorForCourseNumber(code: string, department: string): string {
  const courseNumber = +code.slice(department.length);
  // 1.  Force into unsigned 32-bit range.
  const n = courseNumber >>> 0;

  // 2.  Mix bits with a large odd constant (golden-ratio prime).
  const mixed = Math.imul(n, 0x9E3779B1) >>> 0;

  // 3.  Map into [0, 49] via modulo.
  const idx = mixed % CourseColors.length;

  return CourseColors[idx];
}


function CourseCard({ course, time, className, style }: { course: ScheduleItem; time: ScheduleTime; className?: string; style?: CSSProperties; }) {
  const color = colorForCourseNumber(course.code, course.department);

  return (
    <div className={cn("flex flex-col justify-center items-center border-l-6 rounded-2xl backdrop-blur-md", className)} style={{
      ...style,
      backgroundColor: `color-mix(in srgb, ${color} 40%, transparent)`,
      borderColor: `color-mix(in srgb, ${color} 80%, transparent)`,
      color: `color-mix(in srgb, ${color} 40%, black)`
    }} >
      <p className="font-bold">{course.code} - {course.section}</p>
      <div className="flex items-center gap-2">
        <p className="truncate max-w-36 text-ellipsis">{course.instructors[0]}</p>
        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${color} 80%, black)` }} />
        {time.location && <p>{time.location}</p>}
      </div>
    </div>
  );
}

