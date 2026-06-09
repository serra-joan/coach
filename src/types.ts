export interface CoachActivityData {
  activity: string;
  date: string;
  time: string;
  distance: string;
  calories: string;
  intensities: string[];
  heartRateAverage: string;
  maxHeartRate: number;
  altitudePositive: number;
  altitudeNegative: number;
}

export interface RawActivityData {
  time: number;
  distance: number;
  calories: number;
  intensities: string[];
  heartRateAverage: number;
  maxHeartRate: number;
  altitudePositive: number;
  altitudeNegative: number;
}
