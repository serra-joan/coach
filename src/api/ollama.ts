/**
 * Api to call Ollama models
 */

import type { CoachActivityData } from '../types.js';
import prompts from '../prompts/prompts.json' with { type: 'json' };

const MODEL_API = 'lfm2.5-thinking:latest';
const URL_API = 'http://localhost:11434/';
const HEADERS_API = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

export async function getOpinion({ data, model = null }: { data: CoachActivityData; model?: string | null }): Promise<{ statusCode: number; body: string | { msg: string; model: string } }> {
    if (!model) model = MODEL_API;
    if (!prompts.opinion) {
        console.error('No se ha definido el prompt de opinion');
        return { statusCode: 500, body: 'No se ha definido el prompt de opinion' };
    }

    let prompt = prompts.opinion;

    // Set data
    prompt = prompt.replace('{date}', data.date);
    prompt = prompt.replace('{time}', data.time);
    prompt = prompt.replace('{distance}', data.distance);
    prompt = prompt.replace('{calories}', data.calories);
    prompt = prompt.replace('{activity}', data.activity);
    prompt = prompt.replace('{intensities}', data.intensities.join(', '));
    prompt = prompt.replace('{maxHeartRate}', String(data.maxHeartRate));
    prompt = prompt.replace('{altitudPositive}', String(data.altitudePositive));
    prompt = prompt.replace('{altitudNegative}', String(data.altitudeNegative));
    prompt = prompt.replace('{heartRateAverage}', data.heartRateAverage);

    const body = {
        think: false,
        stream: false,
        model,
        prompt
    };

    try {
        console.log(`Esperando respuesta del modelo ${model ?? 'desconocido'}...`);

        const response = await fetch(`${URL_API}api/generate`, {
            method: 'POST',
            headers: HEADERS_API,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.text();
            return { statusCode: response.status, body: err };
        }

        const result = await response.json();
        const cleanedResponse = cleanText(result.response);
        return { statusCode: 200, body: { msg: cleanedResponse, model } };
    } catch (err) {
        return { statusCode: 500, body: err instanceof Error ? err.message : String(err) };
    }
}

function cleanText(text: string) {
    // Remove <think> ... </think> if exists
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '');

    // Remove line breaks and extra spaces
    text = text
        .split('\n')
        .map(line => line.startsWith('+') ? line.slice(1) : line)
        .join('')
        .trim();

    return text;
}