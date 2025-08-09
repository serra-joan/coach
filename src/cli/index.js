#!/usr/bin/env node
import { getTCX } from '../reader/tcx.js';
import { getOpinion } from '../api/ollama.js';
import pc from 'picocolors';
import packageInfo from '../../package.json' with { type: 'json' };

const CLIENT_VERSION = packageInfo.version;

// Get opinion
async function opinion({model, fileName}) {
    // Get TCX data and convert it
    const parsedData = await getTCX({model, fileName});
    if(!parsedData) {
        console.log(pc.bgRed('No data!:'), 'No hay data a analizar')
    }
    console.log(pc.magenta('Datos analizados:'), JSON.stringify(parsedData));

    // API IA
    // Send parsedData to the AI API
    const response = await getOpinion({data: parsedData, model});
    if(response.statusCode !== 200) {
        console.error(pc.bgRed('Error on api:'), response.body);
        return;
    }

    console.log(pc.green(response.body.model ?? 'Unknown model') + ':');
    console.log(response.body.msg);
    return;
}

function help() {
    console.log(`
        Uso: coach <archivo.tcx> [modelo]
        El parámetro modelo es opcional. Si desas usar un modelo personalizado, 
        pon el nombre del modelo.

        Comandos:
        --help, -h      Muestra esta ayuda
        --version, -v   Muestra la versión

        Ejemplo:
        coach actividad.tcx llama3.2:1b  

        Nota:
        Se usan los modelos de Ollama, por lo tanto es necesario tener ollama instalado.
        Instalación de Ollama -> https://ollama.com/
    `);
    process.exit(0);
}

// Args
const args = process.argv.slice(2);

// Help
if (args.includes('--help') || args.includes('-h')) {
    help();

    // Version
}else if (args.includes('--version') || args.includes('-v')) {
    console.log(`coach versión ${CLIENT_VERSION}`);
    process.exit(0);

}else {
    const command = args[0];

    if(!command) {
        console.error(pc.red(`Argumento no especificado.`));
        help();
    }

    switch(command) {
        case 'opinion':
            // Read the TCX file
            opinion({model: args[2], fileName: args[1]});
            break;

        default:
            console.error(pc.red(`"${command}" argumento desconocido.`));
            help(); // Exit proccess
    }
}
