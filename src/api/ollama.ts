/**
 * Api to call Ollama models
 */

import type { CoachActivityData, OllamaApiBody } from '../types.js';
import { modelConfig } from '../config.d/model.js';
import pc from 'picocolors';

const MODEL_API = 'lfm2.5-thinking:latest';
const URL_API = 'http://localhost:11434/';
const HEADERS_API = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

export async function fetchToModel({ data, model = null, prompt, debugmode = false }: { data: CoachActivityData; model?: string | null, prompt?: string | null, debugmode: boolean }): Promise<{ statusCode: number; body: string | { msg: string; model: string } }> {
    if (!model) model = MODEL_API;
    if (!modelConfig.system) {
        console.error(pc.red('No se ha definido el prompt de opinion'));
        return { statusCode: 500, body: 'No se ha definido el prompt de opinion' };
    }

    let systemText = modelConfig.system;

    // Replace placeholders in the prompt with actual data
    systemText = systemText.replace('{date}', data.date);
    systemText = systemText.replace('{time}', data.time);
    systemText = systemText.replace('{distance}', data.distance);
    systemText = systemText.replace('{calories}', data.calories);
    systemText = systemText.replace('{activity}', data.activity);
    systemText = systemText.replace('{intensities}', data.intensities.join(', '));
    systemText = systemText.replace('{maxHeartRate}', String(data.maxHeartRate));
    systemText = systemText.replace('{altitudPositive}', String(data.altitudePositive));
    systemText = systemText.replace('{altitudNegative}', String(data.altitudeNegative));
    systemText = systemText.replace('{heartRateAverage}', data.heartRateAverage);

    let body: OllamaApiBody = {
        think: true,
        stream: false,
        model,
        system: systemText
    };

    // insert user prompt
    if (prompt && prompt.trim() !== '') body.prompt = prompt;

    const bodyJSON = JSON.stringify(body);

    if (debugmode) console.log(pc.yellow('Debug -> prompt to API:'), bodyJSON);

    try {
        console.log(`Esperando respuesta del modelo ${model ?? 'desconocido'}...\n`);

        const response = await fetch(`${URL_API}api/generate`, {
            method: 'POST',
            headers: HEADERS_API,
            body: bodyJSON
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