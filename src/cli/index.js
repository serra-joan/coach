#!/usr/bin/env node
import pc from 'picocolors';
import { run } from './run.js';
import packageInfo from '../../package.json' with { type: 'json' };


const CLIENT_VERSION = packageInfo.version;

function help() {
    console.log(`
        Uso: coach <comando> <archivo.tcx> [modelo]
        El parámetro modelo es opcional. Si desas usar un modelo personalizado, 
        pon el nombre del modelo.

        Comandos:
        --help, -h      Muestra esta ayuda
        --version, -v   Muestra la versión
        run         Analiza el archivo TCX y da una opinión usando el modelo
        run --debug Analiza el archivo TCX, da una opinión usando el modelo y muestra información adicional de debug

        Ejemplo:
        coach run actividad.tcx llama3.2:1b  

        Nota:
        Se usan los modelos de Ollama, por lo tanto es necesario tener ollama instalado.
        Instalación de Ollama -> https://ollama.com/
    `);
}

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
