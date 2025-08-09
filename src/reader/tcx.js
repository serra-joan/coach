import fs from 'node:fs'
import { parseTCX } from '../parser/tcx_garmin.js';

// Parse the TCX data and converted to and Object
export async function getTCX({model, fileName}) {
    const data = fs.readFileSync(fileName, 'utf-8');
    return parseTCX(data);
}