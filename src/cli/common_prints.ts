export function help() {
    console.log(`
        Example usage:
          coach run <archivo.tcx>                         Analizes the TCX file and gives an opinion using the default model
          coach run <archivo.tcx> --model llama3.2:1b     Analizes the TCX file and gives an opinion using the llama3.2:1b model
            
          Fleags:
            --no-ai           Skip the AI analysis, only parse and print the data
            --debug           Enable debug mode, which prints additional information about the activity
            --model, -m       Specify the model to use for the AI analysis (default is the one set in the API module, which is 'coach:latest')
        

        Fleags:
          --help, -h      Show this help message
          --version, -v   Show the version of the client


        Note:
          The models use Ollama as backend, so you need to have it installed and running on your machine to use custom models or the default one.
          In the future will be added a config file to set other api url to use the models without the need of having Ollama installed locally.
          Actual API url: http://localhost:11434/
        
          Ollama installation -> https://ollama.com/
    `);
}