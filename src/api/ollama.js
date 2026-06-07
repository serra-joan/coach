/**
 * Api to call Ollama models
 */

import prompts from '../prompts/prompts.json' with { type: 'json' };

const MODEL_API = 'lfm2.5-thinking:latest';
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

    try {
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

    } catch (err) {
        return {statusCode: 500, body: err.message};
    }
}

function cleanText(text) {
    // Remove <think> ... </think> if exists
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '');

    // Remove line breaks and extra spaces
    text.split('\n')
        .map(line => line.startsWith('+') ? line.slice(1) : line)
        .join('')
        .trim();

    return text;
}