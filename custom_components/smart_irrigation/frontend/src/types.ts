export interface Dictionary<TValue> {
  [id: string]: TValue;
}

/*export interface AlarmEntity extends HassEntity {
  attributes: HassEntityAttributeBase & {
    code_format: 'number' | 'text';
    code_arm_required: boolean;
    code_disarm_required: boolean;
    disarm_after_trigger: boolean;
    supported_features: number;
    sensors: Dictionary<number>;
    delays: Dictionary<number>;
    users: Dictionary<number>;
    config: number;
    push_target?: string;
    siren_entity?: string;
  };
}*/

export class SmartIrrigationConfig {
  calctime: string;
  use_weather_service: boolean;
  weather_service?: string | null;
  units: string;
  autocalcenabled: boolean;
  autoupdateenabled: boolean;
  autoupdateschedule: string;
  autoupdatedelay: number;
  autoupdateinterval: number;
  cleardatatime: string;
  autoclearenabled: boolean;
  continuousupdates: boolean;
  hourly_calculation: boolean;
  skip_on_freeze?: boolean;
  freeze_threshold?: number | null;
  freeze_sensor?: string | null;
  skip_on_wind?: boolean;
  wind_threshold?: number | null;
  wind_sensor?: string | null;
  skip_on_rain_sensor?: boolean;
  rain_sensor?: string | null;
  sensor_debounce: number;
  irrigation_start_triggers: IrrigationStartTrigger[];
  active_start_trigger: string;
  skip_irrigation_on_precipitation: boolean;
  precipitation_threshold_mm: number;
  manual_coordinates_enabled: boolean;
  manual_latitude?: number;
  manual_longitude?: number;
  manual_elevation?: number;
  days_between_irrigation: number;
  observed_watering_enabled: boolean;
  direct_valve_control_enabled: boolean;
  zone_sequencing: string;
  calc_log_enabled: boolean;

  constructor() {
    this.calctime = "23:00";
    this.use_weather_service = false;
    this.weather_service = null;
    this.units = "";
    this.autocalcenabled = true;
    this.autoupdateenabled = true;
    this.autoupdateschedule = "";
    this.autoupdatedelay = 0;
    this.autoupdateinterval = 0;
    this.autoclearenabled = true;
    this.cleardatatime = "23:59";
    // continuousupdates are disabled by default
    this.continuousupdates = false;
    // the hourly calculation is in beta and off by default
    this.hourly_calculation = false;
    this.sensor_debounce = 100;
    this.irrigation_start_triggers = [];
    this.active_start_trigger = "default";
    this.skip_irrigation_on_precipitation = false;
    this.precipitation_threshold_mm = 2.0;
    this.manual_coordinates_enabled = false;
    this.manual_latitude = undefined;
    this.manual_longitude = undefined;
    this.manual_elevation = undefined;
    this.days_between_irrigation = 0;
    this.observed_watering_enabled = false;
    this.direct_valve_control_enabled = false;
    this.zone_sequencing = "sequential";
    // the calculation audit log is opt-in
    this.calc_log_enabled = false;
  }
}

export interface IrrigationStartTrigger {
  type: string;
  name: string;
  enabled: boolean;
  offset_minutes: number;
  azimuth_angle?: number;
  at?: string;
  account_for_duration: boolean;
}

export enum TriggerType {
  Sunrise = "sunrise",
  Sunset = "sunset",
  SolarAzimuth = "solar_azimuth",
  Time = "time",
}

export enum SmartIrrigationZoneState {
  Disabled = "disabled",
  Manual = "manual",
  Automatic = "automatic",
}

//export type SmartIrrigationZone = {
export class SmartIrrigationZone {
  id?: number;
  name: string;
  size: number;
  throughput: number;
  state: SmartIrrigationZoneState;
  duration: number;
  module?: number;
  bucket: number;
  delta: number;
  et_deficiency: number;
  explanation: string;
  multiplier: number;
  mapping?: number;
  lead_time: number;
  maximum_duration?: number;
  maximum_bucket?: number;
  irrigation_threshold?: number;
  last_calculated?: Date;
  last_updated?: Date;
  number_of_data_points?: number;
  drainage_rate?: number;
  current_drainage?: number;
  linked_entity?: string;
  flow_sensor?: string;
  soil_moisture_sensor?: string;
  soil_moisture_threshold?: number;
  input_method?: string;
  precipitation_rate?: number;
  /** When this zone last watered. Recorded by the run, never by the panel. */
  last_irrigation?: string | null;

  constructor(
    i: number,
    n: string,
    s: number,
    t: number,
    st: SmartIrrigationZoneState,
    d: number,
  ) {
    this.id = i;
    this.name = n;
    this.size = s;
    this.throughput = t;
    this.state = st;
    this.duration = d;
    this.module = undefined;
    this.bucket = 0;
    this.delta = 0;
    this.et_deficiency = 0;
    this.explanation = "";
    this.multiplier = 1.0;
    this.mapping = undefined;
    this.lead_time = 0;
    this.maximum_duration = 3600; //default maximum duration to one hour = 3600 seconds
    this.maximum_bucket = 50; //default maximum bucket size to 50 mm
    this.irrigation_threshold = 0; //water as soon as anything is missing
    this.last_calculated = undefined;
    this.drainage_rate = 50.8; //default mm / hour (=2 inch per hour)
    this.current_drainage = 0;
  }
}

export class SmartIrrigationModule {
  id?: number;
  name: string;
  description: string;
  /**
   * The sensor-group sources this engine reads. Sent by the backend, which
   * declares it next to the engines, so the editor and the calculation cannot
   * disagree about what a group needs.
   */
  consumes?: string[];
  /** Options this engine offers that do nothing for the groups feeding it. */
  idle_options?: string[];
  //duration: number;
  config: object;
  schema: object;
  constructor(i: number, n: string, d: string, c: object, s: object) {
    this.id = i;
    this.name = n;
    this.description = d;
    this.config = c;
    this.schema = s;
    //this.duration = dr;
    //this.module = m;
  }
}

export class SmartIrrigationMapping {
  id?: number;
  name: string;
  mappings: object;
  data?: any[];
  /** An enclosed environment: no rain reaches the zones using this group. */
  greenhouse?: boolean;
  /**
   * The engine this group's sources feed. Undefined means the group has not
   * adopted one, and the zones using it fall back to their own.
   */
  module?: number;

  constructor(i: number, n: string, m: object) {
    this.id = i;
    this.name = n;
    this.mappings = m;
    this.data = undefined;
    this.greenhouse = false;
  }
}

/** One skip condition, as the backend evaluated it. */
export interface SkipCheck {
  id: string;
  /** The user has turned this condition on. */
  enabled: boolean;
  /** We could actually evaluate it. False means "we could not find out". */
  available: boolean;
  /** It is vetoing the run. */
  skip: boolean;
  forecast_mm?: number | null;
  threshold_mm?: number | null;
  days_since?: number | null;
  days_required?: number | null;
  /** Freeze and wind: the reading, its limit, and the unit of both. */
  value?: number | null;
  threshold?: number | null;
  unit?: string | null;
  /** An entity id, or "weather_service". */
  source?: string | null;
  /** Rain sensor. */
  raining?: boolean | null;
  /** Soil moisture, one entry per zone with a sensor. */
  zones?: {
    zone_id: number;
    name: string;
    moisture: number | null;
    threshold: number;
    held: boolean;
  }[];
}

export interface SkipEvaluation {
  should_skip: boolean;
  /** The id of the check that vetoed, when one did. */
  reason?: string | null;
  checks: SkipCheck[];
  /** Only on a recorded decision, not on the live preview. */
  evaluated_at?: string | null;
}

/** A zone's position right now, projected from the last calculation. */
export interface ZoneEstimate {
  bucket: number;
  delta?: number | null;
  duration?: number | null;
  /** The calculation this is measured from. */
  since?: string | null;
  as_of?: string | null;
}

export interface SmartIrrigationInfo {
  next_irrigation_start?: Date;
  next_irrigation_duration?: number;
  next_irrigation_zones?: string[];
  sunrise_time?: Date;
  /** Why the start is at that moment. */
  trigger_name?: string | null;
  trigger_type?: string | null;
  trigger_base?: string | null;
  trigger_accounts_for_duration?: boolean | null;
  /** How the total was counted: sum of the zones, or the longest of them. */
  zone_sequencing?: string | null;
  /** Live estimates keyed by zone id, as a string. Display only. */
  zone_estimates?: Record<string, ZoneEstimate>;
  /** What the checks say now. A forecast can still change before the start. */
  skip_preview?: SkipEvaluation | null;
  /** What they said at the last real decision. */
  last_skip_evaluation?: SkipEvaluation | null;
  error?: string;
}

export interface WeatherRecord {
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  precipitation?: number;
  pressure?: number;
  wind_speed?: number;
  retrieval_time?: Date;
}
