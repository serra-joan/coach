/**
 * Api to call Ollama models
 */

import prompts from '../prompts/prompts.json' with { type: 'json' };

const MODEL_API = 'llama3.2:1b';
const URL_API = 'http://localhost:11434/';
const HEADERS_API = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

export async function getOpinion({data, model = null}) {
    if(!model) model = MODEL_API;
    if(!prompts.opinion) {
        console.error('No se ha definido el prompt de opinion');
        return;
    }

    let prompt = prompts.opinion;

    // Set data
    prompt = prompt.replace('{date}', data.date);
    prompt = prompt.replace('{time}', data.time);
    prompt = prompt.replace('{distance}', data.distance);
    prompt = prompt.replace('{calories}', data.calories);
    prompt = prompt.replace('{activity}', data.activity);
    prompt = prompt.replace('{intensities}', data.intensities);
    prompt = prompt.replace('{maxHeartRate}', data.maxHeartRate);
    prompt = prompt.replace('{altitudPositive}', data.altitudePositive);
    prompt = prompt.replace('{altitudNegative}', data.altitudeNegative);
    prompt = prompt.replace('{heartRateAverage}', data.heartRateAverage);


    const body = {
        think: false,
        stream: false,
        model: model,
        prompt: prompt,
    }

    const response = await fetch(`${URL_API}api/generate`, {
        method: 'POST',
        headers: HEADERS_API,
        body: JSON.stringify(body)
    })

    if(!response.ok) {
        const err = await response.text();
        return {statusCode: response.status, body: err};
    }

    const result = await response.json();
    const cleanedResponse = cleanText(result.response);
    return {statusCode: 200, body: {msg: cleanedResponse, model}};
}

function cleanText(text) {
    return text
        .split('\n')
        .map(line => line.startsWith('+') ? line.slice(1) : line)
        .join('')
        .trim();
}