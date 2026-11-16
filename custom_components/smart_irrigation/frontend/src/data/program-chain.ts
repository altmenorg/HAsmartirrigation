/**
 * Programs that start after another one (schedules of the type "after"),
 * for the editor: which program a schedule may follow without making them
 * start each other in a loop, and which programs follow one, so it is not
 * deleted from under them. The backend refuses both at save
 * (programs.check_program_chains); the panel does not offer them.
 */

import { SmartIrrigationProgram, SmartIrrigationSchedule } from "../types";

/** The program an "after" schedule waits for, or null. */
export const afterProgramOf = (
  schedule: Partial<SmartIrrigationSchedule> | undefined,
): string | null =>
  schedule?.type === "after" && schedule.after_program
    ? schedule.after_program
    : null;

/** The ids of the programs a program waits for, directly or through others. */
export const waitsFor = (
  programs: SmartIrrigationProgram[],
  id: string,
): Set<string> => {
  const found = new Set<string>();
  const todo = [id];
  while (todo.length) {
    const current = todo.pop()!;
    const program = programs.find((p) => p.id === current);
    for (const schedule of program?.schedules || []) {
      const after = afterProgramOf(schedule);
      if (after && !found.has(after)) {
        found.add(after);
        todo.push(after);
      }
    }
  }
  return found;
};

/**
 * Whether ``id`` starting after ``candidate`` would close a loop: the
 * candidate is the program itself, or it already waits for it.
 */
export const wouldLoop = (
  programs: SmartIrrigationProgram[],
  id: string,
  candidate: string,
): boolean => candidate === id || waitsFor(programs, candidate).has(id);

/**
 * The programs one of whose schedules (on or off) starts after ``id``: it
 * cannot be deleted while they do.
 */
export const dependentsOf = (
  programs: SmartIrrigationProgram[],
  id: string | undefined,
): SmartIrrigationProgram[] =>
  id
    ? programs.filter(
        (p) =>
          p.id !== undefined &&
          (p.schedules || []).some((s) => afterProgramOf(s) === id),
      )
    : [];

/** Whether an "after" schedule waits for a program that is not there. */
export const afterIsMissing = (
  programs: SmartIrrigationProgram[],
  schedule: Partial<SmartIrrigationSchedule>,
): boolean =>
  schedule.type === "after" &&
  !programs.some(
    (p) => p.id !== undefined && p.id === (schedule.after_program ?? ""),
  );
