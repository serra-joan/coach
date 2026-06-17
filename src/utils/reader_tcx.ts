import fs from 'node:fs';
import { parseTCX } from './tcx_garmin.js';
import type { CoachActivityData } from '../types.js';

// Parse the TCX data and converted to and Object
export async function getTCX(fileName: string): Promise<CoachActivityData | undefined> {
    const data = fs.readFileSync(fileName, 'utf-8');
    return parseTCX(data);
}