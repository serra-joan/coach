#!/usr/bin/env node
import pc from 'picocolors';
import { run } from './run.js';
import { help } from './common_prints.js';
import packageInfo from '../../package.json' with { type: 'json' };


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

    if(!command) {
        console.error(pc.red(`Argumento no especificado.`));
        help();
    }

    // Warning if debug mode is enabled
    if (debugmode) console.log(pc.yellow('Debug mode enabled'));

    switch(command) {
        case 'run':
            // Read the TCX file and analyze it with the AI API
            await run({model: args[2], fileName: args[1], debugmode});
            break;

        default:
            console.error(pc.red(`"${command}" argumento desconocido.`));
            help(); // Exit proccess
    }

    process.exit(0);
}
