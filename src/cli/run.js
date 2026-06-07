
import pc from 'picocolors';
import { getTCX } from '../reader/tcx.js';
import { getOpinion } from '../api/ollama.js';

// Get opinion of the .tcx run file
export async function run({model, fileName, debugmode}) {
    // Get TCX data and convert it
    const parsedData = await getTCX({model, fileName});

    if(!parsedData) {
        console.log(pc.bgRed('No data!:'), 'No hay data a analizar')
        return;
    }

    printDataPritty(parsedData, debugmode);

    // API IA
    // Send parsedData to the AI API
    const response = await getOpinion({data: parsedData, model});
    if(response.statusCode !== 200) {
        console.error(pc.bgRed('ERROR ON API:'), response.body);
        return;
    }

    console.log(pc.green(response.body.model ?? 'Unknown model') + ':');
    console.log(response.body.msg);
    return;
}

function printDataPritty(data, debugmode) {
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