#!/usr/bin/env node
import pc from 'picocolors';
import { run } from './run.js';
import { help, commands, version } from '../utils/common_prints.js';
import { config } from '../config.d/coach.js';
import { activities, ALLOWED_ACTIONS } from './activities.js';



// Args
const args = process.argv.slice(2);

// Help
if (args.includes('--help') || args.includes('-h')) {
    help();
    process.exit(0);

    // Version
}else if (args.includes('--version') || args.includes('-v')) {
    version();
    process.exit(0);

}else {
    const command = args[0];
    if(!isValidCommand(command)) {
        console.error(pc.red(`"${command}" unknown command.`));
        help();
        process.exit(0);
    }

    // Get flags
    const { debugmode, notRunModel, model, prompt, useSavedData } = getFlags(args);

    // Warning if debug mode is enabled
    if (debugmode) console.log(pc.yellow('Debug mode enabled'));

    switch(command) {
         case 'commands':
            // Print the available commands and their usage
            commands();
            break;
        case 'run':
            // Read the TCX file and analyze it with the AI API
            await run({
                model, 
                prompt, 
                fileName: args[1], 
                flags: { debugmode, notRunModel, useSavedData }
            });
            break;

        case 'activities':
            // need the second argument, which is the type of the activity, like "running" or "cycling"
            if (args.length < 2) {
                console.error(pc.red('The "activities" command needs a second argument'));
                help();
                process.exit(0);
            }

            // the second argument is the action to do with the activities, like "list" or "open"
            const action = args[1] as typeof ALLOWED_ACTIONS[number];
            if (!ALLOWED_ACTIONS.includes(action)) { // check if the action is allowed
                console.error(pc.red(`"${action}" is not a valid action.`),  `Allowed actions are: ${ALLOWED_ACTIONS.join(', ')}`);
                help();
                process.exit(0);
            }

            activities(action, args[2] || undefined); // the third argument is the type of the activity, like "running" or "cycling"
            break;

        default:
            console.error(pc.red(`"${command}" argumento desconocido.`));
            help();
            process.exit(0);
    }

    process.exit(0);
}

function isValidCommand(command: string) {
    const validCommands = ['run', 'activities', 'commands'];
    return validCommands.includes(command);
}

// get flags from args
function getFlags(args: string[]) {
    const flags = args.filter(arg => arg.startsWith('--') || arg.startsWith('-'));
    const debugmode = flags.includes('--debug');
    const notRunModel = flags.includes('--no-ai');

    // get model argument, which is the next argument after a flag --model or -m, if exists
    const modelFlagIndex = args.findIndex(arg => arg === '--model' || arg === '-m');
    let model: string | undefined = undefined;
    if (modelFlagIndex !== -1 && args.length > modelFlagIndex + 1) model = args[modelFlagIndex + 1];


    // get a possible prompt argument, which is the next argument after a flag --prompt or -p, if exists
    const promptFlagIndex = args.findIndex(arg => arg === '--prompt' || arg === '-p');
    let prompt: string | undefined = undefined;
    if (promptFlagIndex !== -1 && args.length > promptFlagIndex + 1) prompt = args[promptFlagIndex + 1];

    // get if the saved data has to be used or not, with a flag --use-saved-data or --no-use-saved-data
    const useSavedDataFlagIndex = args.findIndex(arg => arg === '--use-saved-data' || arg === '--no-use-saved-data');
    let useSavedData: boolean = config.USE_SAVED_DATA; // default value
    if (useSavedDataFlagIndex !== -1) useSavedData = args[useSavedDataFlagIndex] === '--use-saved-data';

    return { 
        debugmode: debugmode, 
        notRunModel: notRunModel, 
        model: model, 
        prompt: prompt ,
        useSavedData: useSavedData
    };
}
