"use client";

import { useState } from "react";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalTitle, ModalTrigger } from "./components/modal";
import { type CourseFilter, useScheduleState } from "./store";
import { courseFuse, courseMap, courses } from "./courses";
import { createSchedules } from "./scheduler";
import { type TimeBlock } from "./store";
import { days, type Day, type Time } from "./store";
import { useMemo } from 'react';
import { Schedule } from "./components/schedule";

export default function SemesterBuilderPage() {
  return (
    <div className="grid grid-cols-[1fr_4fr] h-full">
      <Filters />
      <Schedules />
    </div>
  )
}

function Filters() {
  return (
    <div className="bg-glass flex flex-col">
      <Credits />
      <TimeBlocks />
      <CourseGroups />
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
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
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
    <div className="flex flex-col gap-4">
      {timeBlocks.map((tb: TimeBlock, idx: number) => (
        <div key={idx} className="border rounded-lg p-3 relative w-40">
          {/* Delete button */}
          <button
            className="absolute top-1 right-1 text-sm"
            onClick={() => removeTimeBlock(idx)}
          >
            ×
          </button>

          {/* Day selectors */}
          <div className="flex justify-center space-x-1 mb-2">
            {days.map((d: Day) => (
              <button
                key={d}
                className={`px-1 py-0.5 text-xs rounded ${tb.days.includes(d) ? "bg-gray-300" : "bg-gray-100"
                  }`}
                onClick={() => {
                  const has = tb.days.includes(d);
                  const newDays = has
                    ? tb.days.filter((x) => x !== d)
                    : [...tb.days, d];
                  updateTimeBlock(idx, { ...tb, days: newDays });
                }}
              >
                {d.slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Time inputs */}
          <div className="flex flex-col space-y-1">
            <label className="text-[10px]">Start</label>
            <input
              type="time"
              className="text-xs p-1 border rounded"
              value={formatTimeInput(tb.start)}
              onChange={(e) => {
                const newStart = parseTimeInput(e.target.value);
                updateTimeBlock(idx, { ...tb, start: newStart });
              }}
            />

            <label className="text-[10px]">End</label>
            <input
              type="time"
              className="text-xs p-1 border rounded"
              value={formatTimeInput(tb.end)}
              onChange={(e) => {
                const newEnd = parseTimeInput(e.target.value);
                updateTimeBlock(idx, { ...tb, end: newEnd });
              }}
            />
          </div>
        </div>
      ))}

      {/* Add new time block button */}
      <div
        className="flex items-center justify-center w-40 h-32 border-dashed border-2 rounded-lg cursor-pointer text-xl"
        onClick={() =>
          addTimeBlock({ days: [], start: [8, 0, "Am"], end: [5, 0, "Pm"] })
        }
      >
        +
      </div>
    </div>
  );
}

function Credits() {
  const updateMinCredits = useScheduleState((state) => state.updateMinCredits);
  const updateMaxCredits = useScheduleState((state) => state.updateMaxCredits);

  return (
    <div className="grid grid-cols-2">
      <div className="flex flex-col">
        <label>Min Credits</label>
        <input type="number" min={1} defaultValue={1} onChange={(event) => updateMinCredits(+event.target.value)} />
      </div>

      <div className="flex flex-col">
        <label>Max Credits</label>
        <input type="number" min={1} onChange={(event) => updateMaxCredits(+event.target.value)} />
      </div>
    </div>
  )
}

function CourseGroups() {
  const groups = useScheduleState((state) => state.courseGroups);

  return (
    <div>
      {groups.map((group, groupIndex) => {
        return (
          <div key={groupIndex} className="flex gap-2">
            {group.map((course, index) => <CourseSectionModal key={course.code} filter={course} group={groupIndex} index={index} />)}
            <CourseSearchModal group={groupIndex} />
          </div>
        );
      })}
      <CourseSearchModal group={groups.length} />
    </div>
  )
}

function CourseSearchModal({ group }: { group: number }) {
  const [query, setQuery] = useState("");
  const addCourse = useScheduleState((state) => state.addCourse);
  // const courseGroups = useScheduleState((state) => state.courseGroups);

  const filteredCourses = useMemo(() => courseFuse.search(query).slice(0, 20), [query])

  // TODO: filter courses already in the list

  return (
    <Modal>
      <ModalTrigger>Add</ModalTrigger>
      <ModalContent>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <ModalTitle>Search Courses</ModalTitle>
            <ModalDescription>Filter Below</ModalDescription>
          </div>
          <ModalClose>X</ModalClose>
        </div>

        <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="max-h-100 overflow-auto">
          {
            query.length !== 0 && filteredCourses
              .map(({ item: course }) => (
                <ModalClose
                  key={course.code}
                  onClick={() => addCourse({ code: course.code, sections: course.sections.map((section) => section.sec_code) }, group)}
                >
                  {course.name}
                </ModalClose>
              ))
          }
        </div>
      </ModalContent>
    </Modal>
  )
}

export function CourseSectionModal({ filter, group, index }: { filter: CourseFilter; group: number; index: number; }) {
  const course = courseMap.get(filter.code)!;
  const [instructorFilter, setInstructorFilter] = useState<string>("");
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
    .filter((sec) => instructorFilter ? sec.instructors.includes(instructorFilter) : true)
    .filter((sec) => onlineOnly ? sec.class_meetings.some((cm) => cm.OnlineSync !== undefined) : true);


  const displaySectionCodes = new Set(displayedSections.map((section) => section.sec_code));

  return (
    <Modal>
      <div className="flex items-center space-x-2">
        <ModalTrigger>{course.code}</ModalTrigger>
        <button
          className="text-sm"
          onClick={() => removeCourse(group, filter.code)}
        >
          X
        </button>
      </div>

      <ModalContent>
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <ModalTitle>Course Sections</ModalTitle>
            <ModalDescription>Filter Below</ModalDescription>
          </div>
          <ModalClose>X</ModalClose>
        </div>

        <div>
          <p>Selected</p>
          <div className="flex gap-2">
            {displayedSections.map((section) => <div key={section.sec_code}>{section.sec_code}

              <button onClick={() => {
                // TODO: remove
              }}>X</button>
            </div>)}
          </div>
        </div>

        {/* Instructor dropdown */}
        <div className="mb-4">
          <label className="mr-2 text-sm">Instructor:</label>
          <select
            className="border p-1 rounded"
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
          >
            <option value="">All</option>
            {uniqueInstructors.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
          <label className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={() => setOnlineOnly((prev) => !prev)}
            />
            <span>Online Only?</span>
          </label>
        </div>

        {hasFilter && <div className="flex gap-2">
          <button
            className="mb-4 text-sm underline"
            onClick={() => {
              updateCourseSections(group, filter.code, [...displaySectionCodes]);
            }}
          >
            Add All
          </button>
          <button
            className="mb-4 text-sm underline"
            onClick={() => {
              const newSections = filter.sections.filter((secCode) => !displaySectionCodes.has(secCode));
              updateCourseSections(group, filter.code, newSections);
            }}
          >
            Remove All
          </button>
        </div>}

        {/* Section list with clickable codes and checkmark */}
        <div className="space-y-2 max-h-60 overflow-auto">
          {displayedSections.map((sec) => {
            const isSelected = filter.sections.includes(sec.sec_code);

            return (
              <div
                key={sec.sec_code}
                className="flex items-center justify-between"
              >
                {/* Section code button */}
                <button
                  className="text-left font-mono"
                  onClick={() => {
                    const newSections = isSelected
                      ? filter.sections.filter((code) => code !== sec.sec_code)
                      : [...filter.sections, sec.sec_code];
                    updateCourseSections(index, filter.code, newSections);
                  }}
                >
                  {sec.sec_code}
                </button>

                {/* Checkmark indicating selection */}
                {isSelected && <span className="text-sm">✓</span>}
              </div>
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
    return <p className="text-center text-gray-400 mt-12 h-full">No schedules satisfy your filters.</p>;

  return (
    <div className="px-4 py-6 flex flex-col gap-2 h-full">
      <p>{schedules.length} Schedules</p>
      {schedules.map((schedule) => {
        const scheduleId = schedule.courses.map((course) => `${course.code}-${course.section}`).join(",");
        return <Schedule key={scheduleId} schedule={schedule} />;
      })}
    </div>
  );
}

