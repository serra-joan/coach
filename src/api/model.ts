/**
 * Api to call Ollama models
 */

import type { CoachActivityData, OllamaApiBody } from '../types.js';
import { modelConfig } from '../config.d/model.js';
import { config } from '../config.d/coach.js';
import pc from 'picocolors';

const URL_API = config.API_URL;
const MODEL_API = config.MODEL_TO_USE;
const HEADERS_API = config.HEADERS_API;

export async function fetchToModel({ data, model = null, prompt, savedActivities = null, debugmode = false }: { data: CoachActivityData; model?: string | null, prompt?: string | null, savedActivities?: string | null, debugmode: boolean }): Promise<{ statusCode: number; body: string | { msg: string; model: string } }> {
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
    systemText = systemText.replace('{calories}', String(data.calories));
    systemText = systemText.replace('{activity}', data.activity);
    systemText = systemText.replace('{maxHeartRate}', String(data.maxHeartRate));
    systemText = systemText.replace('{altitudPositive}', String(data.altitudePositive));
    systemText = systemText.replace('{altitudNegative}', String(data.altitudeNegative));
    systemText = systemText.replace('{heartRateAverage}', String(data.heartRateAverage));
    systemText = systemText.replace('{laps}', JSON.stringify(data.laps));

    // if there are saved activities, add the additionalData to the system prompt
    if (savedActivities && savedActivities.trim() !== '') {
        systemText += modelConfig.additionalData;
        systemText = systemText.replace('{savedActivities}', savedActivities);
    }

    let body: OllamaApiBody = {
        think: config.THINK,
        stream: false,
        model,
        messages: [
            {
                role: 'system',
                content: systemText
            }
        ],
        options: {
            temperature: config.TEMPERATURE,
        }
    };

    // insert user prompt
    if (prompt && prompt.trim() !== '') body.messages.push({ role: 'user', content: prompt });

    const bodyJSON = JSON.stringify(body);

    if (debugmode) console.log(pc.yellow('Debug -> prompt to API:'), bodyJSON);

    try {
        console.log(`Esperando respuesta del modelo ${model ?? 'desconocido'}...\n`);

        const response = await fetch(`${URL_API}api/chat`, {
            method: 'POST',
            headers: HEADERS_API,
            body: bodyJSON
        });

        if (!response.ok) {
            const err = await response.text();
            return { statusCode: response.status, body: err };
        }

        const result = await response.json();
        const cleanedResponse = cleanText(result);
        return { statusCode: 200, body: { msg: cleanedResponse, model } };
        
    } catch (err) {
        return { statusCode: 500, body: err instanceof Error ? err.message : String(err) };
    }
}

function cleanText(response: { message?: { content?: string } }): string {
    // get the message
    let message = response.message?.content || '';
    if (message !== '') return message;

    // Remove <think> ... </think> if exists
    message = message.replace(/<think>[\s\S]*?<\/think>/g, '');

    // Remove line breaks and extra spaces
    message = message
        .split('\n')
        .map(line => line.startsWith('+') ? line.slice(1) : line)
        .join('')
        .trim();

    return message;
}