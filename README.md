# Coach CLI

Coach es una herramienta de línea de comandos para analizar archivos de actividades deportivas de Garmin en formato TCX y obtener resúmenes, análisis y recomendaciones con Inteligencia Artificial.

## Requisitos

- Node.js y npm (o pnpm)
- Ollama ejecutándose localmente en http://localhost:11434/ para usar los modelos por defecto o personalizados

## Instalación

Desde la raíz del proyecto puedes instalar la herramienta para uso local o global:

```bash
npm install
```

Si quieres usar el comando `coach` desde cualquier carpeta, instálalo globalmente:

```bash
npm install -g .
```

## Configuración

El proyecto permite sobreescribir la configuración por defecto editando el archivo:

```ts
src/config.d/config.ts
```

Ejemplo:

```ts
export const config = {
    API_URL: 'http://localhost:11434/', // url of the API to use. By default is the local Ollama installation. 
    MODEL_TO_USE: 'lfm2.5-thinking:latest', // Default medgemma1.5:latest
    SAVE_DATA:  true, // Default true. Save the data of the training in json files.
    USE_SAVED_DATA:  false, // Default false. Use the saved data of the same activity type to send to the model.
    TEMPERATURE: 0.7, // Default 0.7. Temperature for the model response.
    THINK:  true, // Default true. Can be a boolean (true/false) or a string ("high", "medium", "low")
};
```

Estas variables sobrescriben los valores iniciales definidos en `src/config.d/coach.ts`.

## Uso

Una vez instalado, puedes ejecutar el comando desde cualquier lugar:

```bash
coach run ruta/archivo.tcx
```

Ejemplos adicionales:

```bash
coach run ruta/archivo.tcx --model llama3.2:1b
coach run ruta/archivo.tcx --prompt "Analiza la carga y recomienda recuperación"
coach run ruta/archivo.tcx --use-saved-data
coach run ruta/archivo.tcx --no-use-saved-data
```

## Flags disponibles

```text
--no-ai               Salta el análisis con IA y muestra solo el parseo de datos
--debug               Activa modo depuración con información adicional
--model, -m           Selecciona el modelo a usar
--prompt, -p          Envía un prompt personalizado a la IA
--use-saved-data      Usa datos guardados del mismo tipo de actividad si existen
--no-use-saved-data   Desactiva el uso de datos guardados aunque existan
```

## Funcionalidades principales

- Analiza archivos TCX de actividades deportivas.
- Genera resúmenes, comentarios y recomendaciones con IA.
- Guarda los resultados en archivos JSON cuando la configuración lo permite.
- Puede reutilizar datos previamente guardados para enriquecer el análisis.