/**
 * Where the setup assistant puts a new zone with "Calculate and water".
 *
 * There is no program that waters every zone: a zone is watered once a
 * program has it in a step. So the assistant puts it in one, the simplest way
 * there is: the only program there is, as its last step; the one the user
 * picks when there are several; or a new program, done by sunrise every day,
 * when there is none (or the user asks for one). Kept free of Lit, so it can
 * be tested on its own.
 */

import { SmartIrrigationProgram, SmartIrrigationStep } from "../types";

/** The choice that asks for a new program rather than one that exists. */
export const NEW_PROGRAM = "__new__";

export interface ZonePlacement {
  /** The programs to save, the zone in one of them. */
  programs: SmartIrrigationProgram[];
  /** The program that waters the zone now. */
  program: SmartIrrigationProgram;
  /** Whether that program was made for it. */
  created: boolean;
}

const step = (
  id: string,
  zoneId: number,
  passes: number,
): SmartIrrigationStep => ({
  id,
  zones: [zoneId],
  mode: "calculated",
  percent: 100,
  seconds: 0,
  passes: Math.max(1, Math.min(6, Math.round(passes) || 1)),
  max_litres: 0,
  min_seconds: 0,
  max_seconds: 0,
  adjust_seconds: 0,
  delay: null,
  enabled: true,
});

/**
 * The programs with ``zoneId`` in one of them.
 *
 * ``target`` is the id of the program chosen, or ``NEW_PROGRAM``; without one
 * the first program takes it (the only one, when there is one). A zone already
 * in the program's steps is not added twice. ``id`` makes the ids of what is
 * created (a step, a program, a schedule).
 */
export const placeNewZone = (
  programs: SmartIrrigationProgram[],
  zoneId: number,
  options: {
    target?: string;
    newName: string;
    passes?: number;
    id: () => string;
  },
): ZonePlacement => {
  const passes = options.passes ?? 1;
  const chosen =
    options.target === NEW_PROGRAM
      ? undefined
      : (programs.find((p) => p.id === options.target) ?? programs[0]);
  if (!chosen) {
    const program: SmartIrrigationProgram = {
      id: `program_${options.id()}`,
      name: options.newName,
      steps: [step(`step_${options.id()}`, zoneId, passes)],
      delay: 0,
      tours: 1,
      // Every day, done by sunrise, the weather judged: what a new garden
      // was watered on before.
      schedules: [
        {
          id: `schedule_${options.id()}`,
          enabled: true,
          type: "sun",
          time: "06:00",
          event: "sunrise",
          offset_minutes: 0,
          anchor: "end",
          weekdays: [],
          every_n_days: 1,
          every_offset: 0,
          parity: "any",
          months: [],
          from_date: null,
          until_date: null,
          weather: true,
        },
      ],
    };
    return { programs: [...programs, program], program, created: true };
  }
  const steps = [...(chosen.steps || [])];
  if (steps.some((s) => (s.zones || []).includes(zoneId))) {
    return { programs, program: chosen, created: false };
  }
  // The wait the steps before take between them goes after the one that was
  // last too, now that one follows it: a program that waits between its
  // zones (the pause between zones of the old main program) keeps doing so.
  const last = steps[steps.length - 1];
  const before = steps[steps.length - 2];
  if (
    last &&
    before &&
    (last.delay === null || last.delay === undefined) &&
    Number(before.delay) > 0
  ) {
    steps[steps.length - 1] = { ...last, delay: before.delay };
  }
  steps.push(step(`step_${options.id()}`, zoneId, passes));
  const program = { ...chosen, steps };
  return {
    programs: programs.map((p) => (p === chosen ? program : p)),
    program,
    created: false,
  };
};
