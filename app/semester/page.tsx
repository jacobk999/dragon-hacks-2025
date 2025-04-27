"use client";

import { useRef, useState } from "react";
import { Modal, ModalClose, ModalContent, ModalTitle, ModalTrigger } from "./components/modal";
import { type CourseFilter, useScheduleState } from "./store";
import { courseFuse, courseMap } from "./courses";
import { createSchedules } from "./scheduler";
import { days, type Day, type Time } from "./store";
import { useMemo } from 'react';
import { Schedule } from "./components/schedule";
import { MultipleCrossCancelDefault, PlusDefault, CheckTickSingle, SearchDefault } from "./components/icons";
import { Input } from "./components/input";
import { useDebounce } from "use-debounce"
import { Chip } from "./components/chip";
import AIControls from "../../lib/AI-Controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select";
import { AnimatePresence, motion } from "motion/react";

export default function SemesterBuilderPage() { 
  return (
    <div className="grid grid-cols-[1fr_5fr] h-full">
      {/* TODO: add  ai purple button */}
      <div className="absolute bottom-16 right-16 bg-indigo-400 h-24 w-24 z-10">AI</div>
      <Filters />
      <div className="flex flex-col h-full overflow-auto">
        <Schedules />
        <AIControls />   {/* ← show the AI box under your schedules */}
      </div >
    </div >
  );
}

function Filters() {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 h-full w-full bg-glass" />
      <div className="mx-auto max-w-64 flex flex-col items-center gap-4 py-4">
        <AnimatePresence>
          <Credits />
          <div className="w-[80%] h-px bg-slate-300/60" />
          <TimeBlocks />
          <div className="w-[80%] h-px bg-slate-300/60" />
          <CourseGroups />
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to format Time ([hour, minute, "Am" | "Pm"]) into HH:MM for <input type="time">
const formatTimeInput = ([hour, minute, kind]: Time): string => {
  let h24 = hour % 12;
  if (kind === "Pm" && hour !== 12) h24 += 12;
  if (kind === "Am" && hour === 12) h24 = 0;
  const hStr = h24.toString().padStart(2, "0");
  const mStr = minute.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
};

// Helper to parse HH:MM string into Time tuple
const parseTimeInput = (value: string): Time => {
  const [hStr, mStr] = value.split(":");
  let h = Number.parseInt(hStr, 10);
  const m = Number.parseInt(mStr, 10);
  const kind: "Am" | "Pm" = h >= 12 ? "Pm" : "Am";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return [h, m, kind];
};

function TimeBlocks() {
  const timeBlocks = useScheduleState((s) => s.timeBlocks);
  const addTimeBlock = useScheduleState((s) => s.addTimeBlock);
  const updateTimeBlock = useScheduleState((s) => s.updateTimeBlock);
  const removeTimeBlock = useScheduleState((s) => s.removeTimeBlock);

  return (
    <AnimatePresence>
      <motion.div layout className="flex flex-col gap-2 w-full items-center">
        <motion.p layout className="font-semibold">Time Blocks</motion.p>
        <motion.div className="flex flex-col gap-4 w-full items-center max-h-84 overflow-y-auto">
          {timeBlocks.map((timeBlock, index) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={timeBlock.id}
              className="w-full rounded-2xl p-3 relative bg-slate-300/15"
            >
              <div className="absolute rounded-2xl inset-0 bg-glass" />
              <p className="mb-2 text-slate-500 uppercase font-semibold text-sm">Time Block</p>
              {/* Delete button */}
              <button
                type="button"
                className="absolute top-2.5 right-2.5 text-sm"
                onClick={() => removeTimeBlock(index)}
              >
                <MultipleCrossCancelDefault variant="stroke" className="size-6 text-slate-400 hover:text-red-400 transition-colors duration-250" />
              </button>
              {/* Day selectors */}
              <div className="flex gap-2 justify-center w-full mb-2">
                {days.map((d: Day) => (
                  <button
                    key={d}
                    type="button"
                    className={`p-1 w-10 h-10 text-xs rounded-md ${timeBlock.days.includes(d) ? "bg-slate-300 text-slate-700" : "bg-slate-100 text-slate-500"}`}
                    onClick={() => {
                      const has = timeBlock.days.includes(d);
                      const newDays = has
                        ? timeBlock.days.filter((x) => x !== d)
                        : [...timeBlock.days, d];
                      updateTimeBlock(index, { ...timeBlock, days: newDays });
                    }}
                  >
                    {d.slice(0, 1).toUpperCase()}{d.slice(1, 2).toLowerCase()}
                  </button>
                ))}
              </div>
              {/* Time inputs */}
              <div className="flex flex-row gap-2">
                <Input
                  type="time"
                  className="text-sm w-1/2"
                  value={formatTimeInput(timeBlock.start)}
                  onChange={(e) => {
                    const newStart = parseTimeInput(e.target.value);
                    updateTimeBlock(index, { ...timeBlock, start: newStart });
                  }}
                />
                <Input
                  type="time"
                  className="text-sm w-1/2"
                  value={formatTimeInput(timeBlock.end)}
                  onChange={(e) => {
                    const newEnd = parseTimeInput(e.target.value);
                    updateTimeBlock(index, { ...timeBlock, end: newEnd });
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add new time block button */}
        <motion.button
          layout
          type="button"
          className="flex items-center justify-center w-full p-2 border-dashed border-2 border-slate-300 text-slate-300 hover:border-slate-400 hover:text-slate-400 hover:bg-slate-200 transition-colors rounded-2xl cursor-pointer text-xl"
          onClick={() => addTimeBlock({ days: [], start: [8, 0, "Am"], end: [5, 0, "Pm"] })
          }
        >
          <PlusDefault variant="stroke" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

function Credits() {
  const updateMinCredits = useScheduleState((state) => state.updateMinCredits);
  const updateMaxCredits = useScheduleState((state) => state.updateMaxCredits);

  return ( 
    <div className="flex flex-col gap-2 w-full items-center">
      <p className="font-semibold">Credits</p>
      <div className="flex items-center w-full py-4 justify-evenly relative rounded-2xl bg-slate-300/15 overflow-hidden">

        {/* <div key={idx} className="w-fit rounded-2xl p-3 relative bg-slate-300/15 overflow-hidden"> */}
        <div className="absolute h-full w-full bg-glass top-0 left-0" />
        <div className="flex flex-col items-center gap-1">
          <label className="text-slate-500 uppercase font-semibold text-sm" htmlFor="minCredits">Min CR</label>
          <Input className="w-fit [&_input]:w-16 [&_input]:h-16 [&_input]:text-center [&_input]:text-2xl" id="minCredits" type="number" min={1} max={20} defaultValue={1} onChange={(event) => updateMinCredits(+event.target.value)} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <label className="text-slate-500 uppercase font-semibold text-sm" htmlFor="maxCredits">Max CR</label>
          <Input className="w-fit [&_input]:w-16 [&_input]:h-16 [&_input]:text-center [&_input]:text-2xl" id="maxCredits" type="number" min={1} max={20} onChange={(event) => updateMaxCredits(+event.target.value)} />
        </div>
      </div>
    </div>
  )
}

function CourseGroups() {
  const groups = useScheduleState((state) => state.courseGroups);

  return (
    <motion.div className="relative flex flex-col gap-2 rounded-2xl w-full">
      <motion.p className="text-center font-semibold">Course Groups</motion.p>
      <div className="flex flex-col gap-2 w-full items-center max-h-52 overflow-y-auto">
      <AnimatePresence initial={false} key={groups.map(g => g.id).join(", ")}>
        {groups.map((group, groupIndex) => {
          return (
            <motion.div
              key={group.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-slate-300/15 grid grid-cols-2 p-3 rounded-2xl gap-2 w-full"
            >
              <div className="absolute inset-0 bg-glass rounded-2xl" />
              {group.courses.map((course, index) => <CourseSectionModal key={course.code} filter={course} group={groupIndex} index={index} />)}
              <CourseSearchModal group={groupIndex} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      </div>
      <CourseSearchModal group={groups.length} />
    </motion.div>
  )
}

function CourseSearchModal({ group }: { group: number }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 100);
  const addCourse = useScheduleState((state) => state.addCourse);

  const searchRef = useRef<HTMLInputElement>(null);

  const courseGroups = useScheduleState((state) => state.courseGroups);
  const selectedCourses = useMemo(() => new Set(courseGroups.flatMap(g => g.courses).map((code) => code.code)), [courseGroups]);
  const filteredCourses = useMemo(() => courseFuse.search(debouncedQuery).slice(0, 20).filter((course) => !selectedCourses.has(course.item.code)), [debouncedQuery, selectedCourses])

  return (
    <Modal>
      <ModalTrigger onClick={() => searchRef.current?.focus()} asChild>
        <motion.button layout type="button" className="bg-slate-400/20 hover:bg-slate-400/40 text-slate-600 transition-colors rounded-lg">
          Add
        </motion.button>
      </ModalTrigger>
      <ModalContent>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <ModalTitle>Search Courses</ModalTitle>
          </div>
          <ModalClose tabIndex={-1}>
            <MultipleCrossCancelDefault variant="stroke" />
          </ModalClose>
        </div>
        <Input
          ref={searchRef}
          className="w-full"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="MATH340"
        >
          <SearchDefault variant="stroke" className="size-4 text-slate-400" />
        </Input>
        <div className="min-h-100 max-h-150 overflow-auto flex flex-col gap-1 items-start">
          {
            query.length !== 0 ? filteredCourses.length !== 0 ? filteredCourses
            .map(({ item: course }) => (
              <ModalClose
                key={course.code}
                onClick={() => addCourse({ code: course.code, sections: course.sections.map((section) => section.sec_code) }, group)}
                className="w-full flex items-start p-2 rounded-lg hover:bg-slate-200 focus:bg-slate-300 outline-none transition-colors"
              >
                <p className="truncate text-nowrap">{course.code} {course.name}</p>
              </ModalClose>
            )) : <div className="h-100 w-full flex items-center justify-center text-slate-400/70">No matching results</div>
          : <div className="h-100 w-full flex items-center justify-center text-slate-400/70">No course has been searched</div>}
        </div>
      </ModalContent>
    </Modal >
  )
}

const MotionChip = motion(Chip);

function CourseSectionModal({ filter, group, index }: { filter: CourseFilter; group: number; index: number; }) {
  const course = courseMap.get(filter.code)!;
  const [instructorFilter, setInstructorFilter] = useState<string>("all");
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);

  // Actions to update/remove selections in store (you'll need to add these to your store)
  const updateCourseSections = useScheduleState((s) => s.updateCourseSections);
  const removeCourse = useScheduleState((s) => s.removeCourse);

  // Compute unique instructors from *all* sections
  const uniqueInstructors = Array.from(
    new Set(course.sections.flatMap((sec) => sec.instructors))
  );

  const hasFilter = !!instructorFilter || onlineOnly;

  // Displayed = every section, optionally filtered by instructor
  const displayedSections = course.sections
    .filter((sec) => instructorFilter !== "all" ? sec.instructors.includes(instructorFilter) : true)
    .filter((sec) => onlineOnly ? sec.class_meetings.some((cm) => cm.OnlineSync !== undefined) : true);

  const displaySectionCodes = new Set(displayedSections.map((section) => section.sec_code));

  return (
    <Modal>
      <MotionChip
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        code={course.code}
        department={course.department}
      >
        <p>{course.code}</p>
        <ModalTrigger className="absolute inset-0" aria-label="Choose Sections" />
        <button
          type="button"
          onClick={() => removeCourse(group, filter.code)}
        >
          <MultipleCrossCancelDefault variant="stroke" />
        </button>
      </MotionChip>

      <ModalContent className="h-150" >
        <div className="flex justify-between items-start mb-2">
          <ModalTitle>Course Sections</ModalTitle>
          <ModalClose>
            <MultipleCrossCancelDefault variant="stroke" />
          </ModalClose>
        </div>

        <div className="w-full">
          <p>Selected Sections</p>
          <div className="flex gap-2 overflow-x-auto">
            {filter.sections.map((section) => (
              <Chip
                key={section}
                section={section}
              >
                <p className="font-mono">{section}</p>
                <button
                  type="button"
                  onClick={() => {
                    const newSections = filter.sections.filter((code) => code !== section);
                    updateCourseSections(index, filter.code, newSections);
                  }}>
                  <MultipleCrossCancelDefault variant="stroke" />
                </button>
              </Chip>
            ))}
          </div>
        </div>

        {/* Instructor dropdown */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-start">
            <label htmlFor="instructor">Instructor</label>
            <Select
              value={instructorFilter}
              onValueChange={setInstructorFilter}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent id="instructor" className="">
                <SelectItem value="all">All</SelectItem>
                {uniqueInstructors.map((instructor) => (
                  <SelectItem key={instructor} value={instructor}>
                    {instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={() => setOnlineOnly((prev) => !prev)}
            />
            <span>Online Only</span>
          </label>
        </div>

        {hasFilter && <div className="flex gap-2">
          <button
            type="button"
            className="text-sm underline"
            onClick={() => {
              updateCourseSections(group, filter.code, [...displaySectionCodes]);
            }}
          >
            Add All
          </button>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => {
              const newSections = filter.sections.filter((secCode) => !displaySectionCodes.has(secCode));
              updateCourseSections(group, filter.code, newSections);
            }}
          >
            Remove All
          </button>
        </div>}

        {/* Section list with clickable codes and checkmark */}
        <div className="flex flex-col gap-2 overflow-auto">
          {displayedSections.map((section) => {
            const isSelected = filter.sections.includes(section.sec_code);

            return (
              <button
                key={section.sec_code}
                type="button"
                className={`flex items-center justify-between p-2 rounded-xl ${isSelected ? "bg-white/40" : ""} transition-colors`}
                onClick={() => {
                  const newSections = isSelected
                    ? filter.sections.filter((code) => code !== section.sec_code)
                    : [...filter.sections, section.sec_code];
                  updateCourseSections(index, filter.code, newSections);
                }}
              >
                <div className="text-left flex gap-2 items-center">
                  <Chip className="font-mono" section={section.sec_code}>{section.sec_code}</Chip> <p>{section.instructors.join(", ")}</p>
                </div>

                {/* Checkmark indicating selection */}
                {isSelected && <CheckTickSingle variant="stroke" />}
              </button>
            );
          })}
        </div>
      </ModalContent>
    </Modal>
  );
}

function Schedules() {
  const timeBlocks = useScheduleState((s) => s.timeBlocks);
  const minCredits = useScheduleState((s) => s.minCredits);
  const maxCredits = useScheduleState((s) => s.maxCredits);
  const courseGroups = useScheduleState((s) => s.courseGroups);

  const schedules = useMemo(() =>
    createSchedules({
      timeBlocks,
      minCredits,
      maxCredits,
      courseGroups,
    }), [timeBlocks, minCredits, maxCredits, courseGroups]);

  if (!schedules.length)
    return <p className="text-center text-gray-400 mt-12">No schedules satisfy your filters.</p>;

  return (
    <div className="px-4 py-6 flex flex-col gap-2">
      <p>{schedules.length} Schedule{schedules.length > 1 ? "s" : ""}</p>
      <AnimatePresence>
        {schedules.map((schedule) => {
          const scheduleId = schedule.courses.map((course) => `${course.code}-${course.section}`).join(",");
          return <Schedule key={scheduleId} schedule={schedule} />;
        })}
      </AnimatePresence>
    </div>
  );
}

