import { parseString } from 'xml2js';
import pc from 'picocolors';

/**
* Parse the TCX data and converted to and Object
* This is only tested with garmin files
*/
export function parseTCX(data) {
    let dataToReturn;

    parseString(data, (err, result) => {
        if(err) {
            console.error(pc.red('Error al analizar el archivo TCX:'), err);
            return;
        }
        const activity = result.TrainingCenterDatabase.Activities[0].Activity[0]
        const [ date ] = activity.Id;
        const laps = activity.Lap;

        // Process the laps of the activity
        const data = processLaps(laps);
        data.date = date;
        data.activity = Object.values(activity)[0].Sport;

        dataToReturn = convertUnits(data);
    })

    return dataToReturn;
}

function processLaps(laps) {
    let baseData = {
        time: 0, // Seconds
        distance: 0, // Meters
        calories: 0,
        intensities: [],
    }
    let altitudesArray = [];
    let heartRatesArray = [];
    let maxHeartRateArray = [];

    laps.forEach(lap => { // For each lap, general information per lap. 
        // Raw data
        const [ distance ] = lap.DistanceMeters;
        const [ time ] = lap.TotalTimeSeconds;
        const [ calories ] = lap.Calories;
        const [ intensity ] = lap.Intensity;
        const [ maxHeartRate ] = lap.MaximumHeartRateBpm[0].Value;

        // Parsed data
        baseData.time += parseFloat(time);
        baseData.distance += parseFloat(distance);
        baseData.calories += parseFloat(calories);

        // Push to arrays to calculate later
        baseData.intensities.push(intensity);
        maxHeartRateArray.push(maxHeartRate);

        // More acurate points
        const rawTrackPoints = lap.Track[0].Trackpoint;
        rawTrackPoints.forEach(point => { // For each track point, here there are the heart, altitude, position.
            // Raw data
            const [ altitude ] = point.AltitudeMeters;
            const [ heartRate ] = point.HeartRateBpm[0].Value;
            //const [ time ] = point.Time;
            //const distance = point.DistanceMeters;
            //const { LatitudeDegrees: latitudeRaw, LongitudeDegrees: longitudeRaw } = point.Position[0];
            //const [ lat ] = latitudeRaw;
            //const [ lon ] = longitudeRaw;

            // Push to arrays to calculate later
            altitudesArray.push(Number(altitude));
            heartRatesArray.push(Number(heartRate));
        })
    });

    // Heart Rate Average
    const averageHeartRate = heartRatesArray.reduce((a, b) => a + b, 0) / heartRatesArray.length;
    baseData.heartRateAverage = averageHeartRate;

    // Max Heart Rate
    const maxHeartRateValue = Math.max(...maxHeartRateArray);
    baseData.maxHeartRate = maxHeartRateValue;

    // Altitude Positive and Negative
    const { positive, negative } = altitudeCalcul(altitudesArray);
    baseData.altitudePositive = positive;
    baseData.altitudeNegative = negative;

    return baseData;
}

function altitudeCalcul(altitudes, threshold = 0, smoothing = 15) {
    let positive = 0;
    let negative = 0;

    // Filter small changes
    const fulteredAltitudes = altitudes.map((_, i, arr) => { // _ ignore, i index, arr all array
        const init = Math.max(0, i - smoothing);
        const fin = Math.min(arr.length, i + smoothing);
        const segmento = arr.slice(init, fin);

        return segmento.reduce((a, b) => a + b, 0) / segmento.length;
    });

    // Calculate differences
    for (let i = 1; i < fulteredAltitudes.length; i++) {
        const actualAltitude = fulteredAltitudes[i];
        const previousAltitude = fulteredAltitudes[i - 1];

        const diff = actualAltitude - previousAltitude;

        if (Math.abs(diff) >= threshold) {
            if (diff > 0) positive += diff;
            else negative += Math.abs(diff);
        }
    }

    return { positive: Math.round(positive), negative: Math.round(negative) };
}

function convertUnits(data) {
    data.time = (data.time / 60).toFixed(2); // Minutes
    data.distance = (data.distance / 1000).toFixed(2); // Kilometers
    data.date = new Date(data.date).toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
    data.heartRateAverage = data.heartRateAverage.toFixed(2);

    return data;
}
