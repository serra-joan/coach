import { parseString } from 'xml2js'
import pc from 'picocolors'
import type { CoachActivityData, RawActivityData } from '../types.js'

/**
 * Parse a TCX file
 * @param data
 * @returns 
 */
export function parseTCX(data: string): CoachActivityData | undefined {
    let dataToReturn: CoachActivityData | undefined

    // parse the TCX file with xml2js
    parseString(data, (err: Error | null, result: any) => {
        if (err) {
            console.error(pc.red('Error al analizar el archivo TCX:'), err)
            return
        }

        // activity is where is the main data
        const activity = result.TrainingCenterDatabase.Activities[0].Activity[0]
        const [date] = activity.Id
        const laps = activity.Lap

        // process the laps and get the data to return
        const parsed = processLaps(laps) as RawActivityData & { date: string; activity: string }
        parsed.date = date
        
        // get the name of the activity (it's an attribute of the tag)
        const activityValues = Object.values(activity) as any[]
        parsed.activity = activityValues[0]?.Sport

        dataToReturn = convertUnits(parsed)
    })

    return dataToReturn
}

/**
 * Process laps from the TCX file. Calculate the total time, distance, calories, intensities, heart rate average, max heart rate, altitude positive and negative of the activity,
 *  as well as the same data for each lap.
 * @param laps 
 * @returns 
 */
function processLaps(laps: any[]): RawActivityData {
    const baseData: RawActivityData = {
        time: 0,
        distance: 0,
        calories: 0,
        heartRateAverage: 0,
        maxHeartRate: 0,
        altitudePositive: 0,
        altitudeNegative: 0,
        laps: []
    }

    const altitudesArray: number[] = []
    const heartRatesArray: number[] = []
    const maxHeartRateArray: number[] = []

    laps.forEach(lap => {
        let altitudLap: number[] = []
        const [distance] = lap.DistanceMeters
        const [time] = lap.TotalTimeSeconds
        const [calories] = lap.Calories
        const [intensity] = lap.Intensity
        const [maxHeartRate] = lap.MaximumHeartRateBpm[0].Value
        const [heartRateAverage] = lap.AverageHeartRateBpm[0].Value

        maxHeartRateArray.push(parseFloat(maxHeartRate))

        const rawTrackPoints = lap.Track[0].Trackpoint
        rawTrackPoints.forEach((point: any) => {
            // it's possible to calculate the average with the 'heartRateAverage' from the lap, 
            // but I prefer to calculate it with the track points, to be more accurate
            const [heartRate] = point.HeartRateBpm[0].Value
            const [altitude] = point.AltitudeMeters
            
            altitudLap.push(Number(altitude))
            altitudesArray.push(Number(altitude))
            heartRatesArray.push(Number(heartRate))
        })

        // set data on the baseDate
        baseData.time += parseFloat(time)
        baseData.distance += parseFloat(distance)
        baseData.calories += parseFloat(calories)

        // set lap data
        const { positive, negative } = altitudeCalcul(altitudLap)
        baseData.laps.push({
            time: parseFloat(time),
            intensities: intensity,
            altitudePositive: positive,
            altitudeNegative: negative,
            distance: parseFloat(distance),
            maxHeartRate: parseFloat(maxHeartRate),
            heartRateAverage: parseFloat(heartRateAverage),
        })
    })

    // calculate average heart rate and max heart rate
    const averageHeartRate = heartRatesArray.reduce((a, b) => a + b, 0) / heartRatesArray.length
    baseData.heartRateAverage = averageHeartRate
    baseData.maxHeartRate = Math.max(...maxHeartRateArray)

    // calculate altitude positive and negative
    const { positive, negative } = altitudeCalcul(altitudesArray)
    baseData.altitudePositive = positive
    baseData.altitudeNegative = negative

    return baseData
}

/** calculate the positive and negative altitude of an array of altitudes
 * @param altitudes array of altitudes
 * @param threshold minimum difference between two altitudes to be considered a positive or negative altitude, in meters
 * @param smoothing number of points to smooth the altitude, to avoid GPS errors
 * @returns an object with the positive and negative altitude in meters
 */
function altitudeCalcul(altitudes: number[], threshold = 0, smoothing = 15) {
    let positive = 0
    let negative = 0

    const filteredAltitudes = altitudes.map((_, i, arr) => {
        const init = Math.max(0, i - smoothing)
        const fin = Math.min(arr.length, i + smoothing)
        const segmento = arr.slice(init, fin)
        return segmento.reduce((a, b) => a + b, 0) / segmento.length
    })

    for (let i = 1; i < filteredAltitudes.length; i++) {
        const actualAltitude = filteredAltitudes[i]
        const previousAltitude = filteredAltitudes[i - 1]
        const diff = actualAltitude - previousAltitude

        if (Math.abs(diff) >= threshold) {
            if (diff > 0) positive += diff
            else negative += Math.abs(diff)
        }
    }

    return { positive: Math.round(positive), negative: Math.round(negative) }
}

/**
 * Convert values to readable units
 * @param data 
 * @returns 
 */
function convertUnits(data: RawActivityData & { date: string; activity: string }): CoachActivityData {
    let parseData = {
        date: new Date(data.date).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        activity: data.activity,
        time: (data.time / 60).toFixed(2),
        distance: (data.distance / 1000).toFixed(2),
        calories: Math.round(data.calories),
        heartRateAverage: Math.round(data.heartRateAverage),
        maxHeartRate: data.maxHeartRate,
        altitudePositive: data.altitudePositive,
        altitudeNegative: data.altitudeNegative,
        laps: data.laps.map(lap => ({
            time: (lap.time / 60).toFixed(2),
            distance: (lap.distance / 1000).toFixed(2),
            intensities: lap.intensities,
            heartRateAverage: Math.round(lap.heartRateAverage),
            maxHeartRate: lap.maxHeartRate,
            altitudePositive: lap.altitudePositive,
            altitudeNegative: lap.altitudeNegative,
        }))
    }

    return parseData
}
