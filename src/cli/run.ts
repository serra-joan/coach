
import pc from 'picocolors';
import { getTCX } from '../reader/tcx.js';
import { fetchToModel } from '../api/model.js';
import type { CoachActivityData } from '../types.js';

export async function run({ model, prompt, fileName, debugmode, notRunModel }: { model?: string; prompt?: string; fileName?: string; debugmode: boolean; notRunModel: boolean }) {
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


    // API IA
    // ai can be skipped with --no-ai flag
    if (notRunModel) {
        console.log(pc.yellow('AI analysis skipped.'));
        return;
    }
    
    // Send parsedData to the AI API
    const response = await fetchToModel({ data: parsedData, model, prompt, debugmode });
    if (response.statusCode !== 200) {
        console.error(pc.bgRed('ERROR ON API:'), response.body);
        return;
    }

    if (typeof response.body === 'string') {
        console.log(response.body);
    } else {
        console.log(response.body.msg);
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