#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { run } from './run.js';
import { help } from './common_prints.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version: string };

const CLIENT_VERSION = packageInfo.version;

// Args
const args = process.argv.slice(2);

// Help
if (args.includes('--help') || args.includes('-h')) {
    help();
    process.exit(0);

    // Version
}else if (args.includes('--version') || args.includes('-v')) {
    console.log(`coach versión ${CLIENT_VERSION}`);
    process.exit(0);

}else {
    const command = args[0];
    // Get flags
    const flags = args.filter(arg => arg.startsWith('--') || arg.startsWith('-'));
    const debugmode = flags.includes('--debug');
    const notRunModel = flags.includes('--no-ai');

    if(!command) {
        console.error(pc.red(`Argumento no especificado.`));
        help();
    }

    // Warning if debug mode is enabled
    if (debugmode) console.log(pc.yellow('Debug mode enabled'));

    switch(command) {
        case 'run':
            // Read the TCX file and analyze it with the AI API
            await run({model: args[2], fileName: args[1], debugmode, notRunModel});
            break;

        default:
            console.error(pc.red(`"${command}" argumento desconocido.`));
            help(); // Exit proccess
    }

    process.exit(0);
}
