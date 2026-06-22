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
  units: string;
  autocalcenabled: boolean;
  autoupdateenabled: boolean;
  autoupdateschedule: string;
  autoupdatedelay: number;
  autoupdateinterval: number;
  cleardatatime: string;
  autoclearenabled: boolean;
  continuousupdates: boolean;
  sensor_debounce: number;
  irrigation_start_triggers: IrrigationStartTrigger[];
  skip_irrigation_on_precipitation: boolean;
  precipitation_threshold_mm: number;
  manual_coordinates_enabled: boolean;
  manual_latitude?: number;
  manual_longitude?: number;
  manual_elevation?: number;
  days_between_irrigation: number;

  constructor() {
    this.calctime = "23:00";
    this.use_weather_service = false;
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
    this.sensor_debounce = 100;
    this.irrigation_start_triggers = [];
    this.skip_irrigation_on_precipitation = false;
    this.precipitation_threshold_mm = 2.0;
    this.manual_coordinates_enabled = false;
    this.manual_latitude = undefined;
    this.manual_longitude = undefined;
    this.manual_elevation = undefined;
    this.days_between_irrigation = 0;
  }
}

export interface IrrigationStartTrigger {
  type: string;
  name: string;
  enabled: boolean;
  offset_minutes: number;
  azimuth_angle?: number;
  account_for_duration: boolean;
}

export enum TriggerType {
  Sunrise = "sunrise",
  Sunset = "sunset",
  SolarAzimuth = "solar_azimuth",
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
  explanation: string;
  multiplier: number;
  mapping?: number;
  lead_time: number;
  maximum_duration?: number;
  maximum_bucket?: number;
  last_calculated?: Date;
  last_updated?: Date;
  number_of_data_points?: number;
  drainage_rate?: number;
  current_drainage?: number;

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
    this.explanation = "";
    this.multiplier = 1.0;
    this.mapping = undefined;
    this.lead_time = 0;
    this.maximum_duration = 3600; //default maximum duration to one hour = 3600 seconds
    this.maximum_bucket = 50; //default maximum bucket size to 50 mm
    this.last_calculated = undefined;
    this.drainage_rate = 50.8; //default mm / hour (=2 inch per hour)
    this.current_drainage = 0;
  }
}

export class SmartIrrigationModule {
  id?: number;
  name: string;
  description: string;
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

  constructor(i: number, n: string, m: object) {
    this.id = i;
    this.name = n;
    this.mappings = m;
    this.data = undefined;
  }
}

export interface SmartIrrigationInfo {
  next_irrigation_start?: Date;
  next_irrigation_duration?: number;
  next_irrigation_zones?: string[];
  irrigation_reason?: string;
  sunrise_time?: Date;
  total_irrigation_duration?: number;
  irrigation_explanation?: string;
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
