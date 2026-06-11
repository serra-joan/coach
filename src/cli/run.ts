
import pc from 'picocolors';
import { getTCX } from '../reader/tcx.js';
import { fetchToModel } from '../api/model.js';
import { config } from '../config.d/coach.js';
import type { CoachActivityData } from '../types.js';
import { save as saveData, list as listData } from './manage_saved_data.js';

const SAVE_DATA: boolean = config.SAVE_DATA; // Save the data of the training in json files. Default true.
const USE_SAVED_DATA: boolean = true; // Use the saved data of the same activity type to send to the model. Default true.

export async function run({ model, prompt, fileName, flags }
    : { model?: string; prompt?: string; fileName?: string; flags: { debugmode: boolean; notRunModel: boolean; useSavedData: boolean } }) {
    const { debugmode, notRunModel, useSavedData } = flags;

    if (!fileName) {
        console.error(pc.red('No se ha especificado archivo TCX.'));
        return;
    }

    const parsedData = await getTCX({ model, fileName });

    if (!parsedData) {
        console.log(pc.bgRed('No data!:'), 'No hay data a analizar');
        return;
    }

    printDataPritty(parsedData, debugmode);

    if (SAVE_DATA) {
        saveData(parsedData, debugmode);
    }

    // API IA
    // ai can be skipped with --no-ai flag
    if (notRunModel) {
        console.log(pc.yellow('AI analysis skipped.'));
        return;
    }

    // if the saved data has to be used
    let savedActivities: string | null = null
    if ((USE_SAVED_DATA && useSavedData) || useSavedData) {
        console.log(pc.yellow('Debug -> using saved data of the same activity type:'));
        savedActivities = await listData(parsedData.activity, debugmode) as string;
    }
    
    // Send parsedData to the AI API
    const response = await fetchToModel({ data: parsedData, model, prompt, savedActivities: savedActivities || null, debugmode });
    if (response.statusCode !== 200) {
        console.error(pc.bgRed('ERROR ON API:'), response.body);
        return;
    }

    if (typeof response.body === 'string') {
        console.log(response.body || pc.yellow('No response from model'));
    } else {
        console.log(response.body.msg || pc.yellow('No response from model'));
    }
    return;
}

function printDataPritty(data: CoachActivityData, debugmode: boolean) {
    console.log(pc.blue('Actividad:'), data.activity);
    console.log(pc.blue('Fecha:'), data.date);
    console.log(pc.blue('Tiempo total:'), `${data.time} minutos`);
    console.log(pc.blue('Distancia total:'), `${data.distance} km`);
    console.log(pc.blue('Calorías totales:'), `${data.calories} kcal`);
    console.log(pc.blue('Frecuencia cardíaca media:'), `${data.heartRateAverage} bpm`);
    console.log(pc.blue('Frecuencia cardíaca máxima:'), `${data.maxHeartRate} bpm`);
    console.log(pc.blue('Desnivel:'), `↑${data.altitudePositive} m / ↓${data.altitudeNegative} m`);

    if (debugmode) {
        console.log(pc.yellow('Debug -> print json:'), JSON.stringify(data, null, 2));
    }
} 