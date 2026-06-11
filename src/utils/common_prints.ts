import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function help() {
    console.log(`
Example usage:
  coach run <file.tcx>
  coach run <file.tcx> --model llama3.2:1b
  coach activities <action> [type]

Other commands:
  coach --help, -h      Show this help message
  coach --version, -v   Show the version of the client

Further help:
  coach commands

Note:
  The models use Ollama as backend, so you need to have it installed and running on your machine to use custom models or the default one.
  In the future will be added a config file to set other api url to use the models without the need of having Ollama installed locally.
  Actual API url: http://localhost:11434/
        
  Ollama installation -> https://ollama.com/
    `);
}

export function commands() {
      console.log(`
run:
  coach run <file.tcx>                         Analizes the TCX file and gives an opinion using the default model
  coach run <file.tcx> --model llama3.2:1b     Analizes the TCX file and gives an opinion using the llama3.2:1b model
            
  Flags:
    --no-ai               Skip the AI analysis, only parse and print the data
    --debug               Enable debug mode, which prints additional information about the activity
    --model, -m           Specify the model to use for the AI analysis (default is the one set in the API module, which is 'coach:latest')
    --prompt, -p          Specify a custom prompt to send to the model.
    --use-saved-data      Use the saved data of the same activity type to send to the model, if exists. Default false.
    --no-use-saved-data   Do not use the saved data of the same activity type to send to the model, even if exists. This flag has priority over --use-saved-data.


activities:
  coach activities <action> [type]             Manage saved activities. Actions: list, open, remove. Type is the name of the activity, like "running" or "cycling". Required for open and remove actions.

  Actions:
    list                List all saved activities (only the names)
    open <type>         Print the data of the activity with the specified type
    remove <type>       Remove the activity with the specified type
`);
}

export function version() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = path.join(__dirname, '../../package.json');
  const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version: string };

  console.log(`coach versión ${packageInfo.version || 'unknown'}`);
}