export const config = {
    API_URL: 'http://localhost:11434/',
    MODEL_TO_USE: 'lfm2.5-thinking:latest',
    HEADERS_API: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    SAVE_DATA: true, // Default true. Save the data of the training in json files.
    
} as const