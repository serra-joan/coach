import { Config, ConfigOverride } from '../types.js';
import { config as overrideConfig } from './config.js';

const override: ConfigOverride | undefined = overrideConfig;
export const config: Config = {
    API_URL:  override?.API_URL ?? 'http://localhost:11434/',
    MODEL_TO_USE: override?.MODEL_TO_USE ?? 'medgemma1.5:latest',
    HEADERS_API: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    SAVE_DATA:  override?.SAVE_DATA ?? true, // Default true. Save the data of the training in json files.
    USE_SAVED_DATA:  override?.USE_SAVED_DATA ?? false, // Default false. Use the saved data of the same activity type to send to the model.
    TEMPERATURE:  override?.TEMPERATURE ?? 0.7, // Default 0.7. Temperature for the model response.
    THINK:  override?.THINK ?? true, // Default true. Can be a boolean (true/false) or a string ("high", "medium", "low")
    
} as const