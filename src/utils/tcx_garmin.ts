import { parseString } from 'xml2js';
import pc from 'picocolors';
import type { CoachActivityData, RawActivityData } from '../types.js';

export function parseTCX(data: string): CoachActivityData | undefined {
    let dataToReturn: CoachActivityData | undefined;

    parseString(data, (err: Error | null, result: any) => {
        if (err) {
            console.error(pc.red('Error al analizar el archivo TCX:'), err);
            return;
        }

        const activity = result.TrainingCenterDatabase.Activities[0].Activity[0];
        const [date] = activity.Id;
        const laps = activity.Lap;

        const parsed = processLaps(laps) as RawActivityData & { date: string; activity: string };
        parsed.date = date;
        const activityValues = Object.values(activity) as any[];
        parsed.activity = activityValues[0]?.Sport;

        dataToReturn = convertUnits(parsed);
    });

    return dataToReturn;
}

function processLaps(laps: any[]): RawActivityData {
    const baseData: RawActivityData = {
        time: 0,
        distance: 0,
        calories: 0,
        intensities: [],
        heartRateAverage: 0,
        maxHeartRate: 0,
        altitudePositive: 0,
        altitudeNegative: 0
    };

    const altitudesArray: number[] = [];
    const heartRatesArray: number[] = [];
    const maxHeartRateArray: number[] = [];

    laps.forEach(lap => {
        const [distance] = lap.DistanceMeters;
        const [time] = lap.TotalTimeSeconds;
        const [calories] = lap.Calories;
        const [intensity] = lap.Intensity;
        const [maxHeartRate] = lap.MaximumHeartRateBpm[0].Value;

        baseData.time += parseFloat(time);
        baseData.distance += parseFloat(distance);
        baseData.calories += parseFloat(calories);

        baseData.intensities.push(intensity);
        maxHeartRateArray.push(parseFloat(maxHeartRate));

        const rawTrackPoints = lap.Track[0].Trackpoint;
        rawTrackPoints.forEach((point: any) => {
            const [altitude] = point.AltitudeMeters;
            const [heartRate] = point.HeartRateBpm[0].Value;

            altitudesArray.push(Number(altitude));
            heartRatesArray.push(Number(heartRate));
        });
    });

    const averageHeartRate = heartRatesArray.reduce((a, b) => a + b, 0) / heartRatesArray.length;
    baseData.heartRateAverage = averageHeartRate;

    baseData.maxHeartRate = Math.max(...maxHeartRateArray);

    const { positive, negative } = altitudeCalcul(altitudesArray);
    baseData.altitudePositive = positive;
    baseData.altitudeNegative = negative;

    return baseData;
}

function altitudeCalcul(altitudes: number[], threshold = 0, smoothing = 15) {
    let positive = 0;
    let negative = 0;

    const filteredAltitudes = altitudes.map((_, i, arr) => {
        const init = Math.max(0, i - smoothing);
        const fin = Math.min(arr.length, i + smoothing);
        const segmento = arr.slice(init, fin);
        return segmento.reduce((a, b) => a + b, 0) / segmento.length;
    });

    for (let i = 1; i < filteredAltitudes.length; i++) {
        const actualAltitude = filteredAltitudes[i];
        const previousAltitude = filteredAltitudes[i - 1];
        const diff = actualAltitude - previousAltitude;

        if (Math.abs(diff) >= threshold) {
            if (diff > 0) positive += diff;
            else negative += Math.abs(diff);
        }
    }

    return { positive: Math.round(positive), negative: Math.round(negative) };
}

function convertUnits(data: RawActivityData & { date: string; activity: string }): CoachActivityData {
    return {
        date: new Date(data.date).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        activity: data.activity,
        time: (data.time / 60).toFixed(2),
        distance: (data.distance / 1000).toFixed(2),
        calories: data.calories.toFixed(0),
        intensities: data.intensities,
        heartRateAverage: data.heartRateAverage.toFixed(),
        maxHeartRate: data.maxHeartRate,
        altitudePositive: data.altitudePositive,
        altitudeNegative: data.altitudeNegative
    };
}
