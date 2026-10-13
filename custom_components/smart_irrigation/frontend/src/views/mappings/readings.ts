/**
 * Whether a sensor group can leave out its weather readings (temperature,
 * humidity, wind, pressure, dew point, radiation).
 *
 * The zones decide, as they do in the calculation: a zone Smart Irrigation
 * calculates reads those readings, a zone whose evapotranspiration is provided
 * reads only that. So the readings are left out only when every zone of the
 * group takes its evapotranspiration ready-made. A group no zone reads yet
 * follows its own evapotranspiration source: given ready-made, the readings
 * would only serve to recalculate it.
 *
 * The group's source alone used to decide, and a group that had kept a
 * ready-made source from an older version hid the readings its calculated
 * zones need (#909).
 */
export function readingsNotNeeded(
  zones: { provided: number; calculated: number },
  etProvided: boolean,
): boolean {
  if (zones.calculated + zones.provided > 0) {
    return zones.calculated === 0;
  }
  return etProvided;
}
