/**
 * The runs Start names under its headline: the next morning (or evening), in
 * the order they will water.
 *
 * The planning places each run behind the one it waits for
 * (`expected_start`). Start named only the soonest program (UX walk of 13
 * Nov., Q11); a second program due the same morning was not mentioned at all.
 */
export interface PlannedRun {
  program_id?: string;
  program?: string;
  start: string;
  expected_start?: string;
  expected_end?: string;
  [key: string]: unknown;
}

const begins = (run: PlannedRun): number =>
  Date.parse(run.expected_start ?? run.start);

/**
 * The runs still to come that begin within `windowHours` of the first, at
 * most `max`.
 */
export const nextRuns = (
  planning: PlannedRun[],
  now: number,
  windowHours = 12,
  max = 5,
): PlannedRun[] => {
  const ahead = planning
    .filter((run) => begins(run) > now)
    .sort((a, b) => begins(a) - begins(b));
  if (!ahead.length) return [];
  const first = begins(ahead[0]);
  const runs = ahead
    .filter((run) => begins(run) < first + windowHours * 3600 * 1000)
    .slice(0, max);
  return runs;
};
