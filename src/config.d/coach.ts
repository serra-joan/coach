export const config = {
    API_URL: 'http://localhost:11434/',
    MODEL_TO_USE: 'lfm2.5-thinking:latest',
    HEADERS_API: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    SAVE_DATA: true, // Default true. Save the data of the training in json files.
    USE_SAVED_DATA: false, // Default false. Use the saved data of the same activity type to send to the model.
    TEMPERATURE: 0.7, // Default 0.7. Temperature for the model response.
    THINK: true, // Default true. Can be a boolean (true/false) or a string ("high", "medium", "low")
    
} as const