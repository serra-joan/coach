// File to override the defualt configuration of the project
export const config = {
    // API_URL: 'http://localhost:11434/', // url of the API to use. By default is the local Ollama installation. 
    MODEL_TO_USE: 'lfm2.5-thinking:latest', // Default medgemma1.5:latest
    // SAVE_DATA:  true, // Default true. Save the data of the training in json files.
    // USE_SAVED_DATA:  false, // Default false. Use the saved data of the same activity type to send to the model.
    // TEMPERATURE: 0.7, // Default 0.7. Temperature for the model response.
    THINK:  false, // Default true. Can be a boolean (true/false) or a string ("high", "medium", "low")
}