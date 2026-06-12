export interface CoachActivityData {
  activity: string;
  date: string;
  time: string;
  distance: string;
  calories: number;
  heartRateAverage: number;
  maxHeartRate: number;
  altitudePositive: number;
  altitudeNegative: number;
  laps: {
    time: string;
    distance: string;
    intensities: string;
    heartRateAverage: number;
    maxHeartRate: number;
    altitudePositive: number;
    altitudeNegative: number;
  }[];
}

export interface RawActivityData {
  time: number;
  distance: number;
  calories: number;
  heartRateAverage: number;
  maxHeartRate: number;
  altitudePositive: number;
  altitudeNegative: number;
  laps: {
    time: number;
    distance: number;
    intensities: string;
    heartRateAverage: number;
    maxHeartRate: number;
    altitudePositive: number;
    altitudeNegative: number;
  }[];
}

export interface OllamaApiBody {
  think: boolean | 'high' | 'medium' | 'low';
  stream: boolean;
  model: string;
  messages: {
      role: 'system' | 'user';
      content: string;
  }[];
  options: {
      temperature: number;
  };
}

export interface Config {
  API_URL: string;
  MODEL_TO_USE: string;
  HEADERS_API: {
      'Content-Type': string;
      'Accept': string;
  };
  SAVE_DATA: boolean;
  USE_SAVED_DATA: boolean;
  TEMPERATURE: number;
  THINK: boolean | 'high' | 'medium' | 'low';
}

export interface ConfigOverride {
  API_URL?: string;
  MODEL_TO_USE?: string;
  SAVE_DATA?: boolean;
  USE_SAVED_DATA?: boolean;
  TEMPERATURE?: number;
  THINK?: boolean | 'high' | 'medium' | 'low';
}