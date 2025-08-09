# Coach CLI

Coach es una herramienta de línea de comandos para analizar archivos de actividades deportivas, de Garmin, en formato TCX y obtener resúmenes, análisis y recomendaciones utilizando inteligencia artificial.

## Instalación

Puedes instalar Coach globalmente usando npm:

```bash
npm install -g .
```

Asegúrate de estar en la raíz del proyecto al ejecutar este comando.

## Uso

Una vez instalado, puedes ejecutar el comando `coach` desde cualquier lugar en tu terminal.

Para ver todas las opciones y cómo funciona el CLI, ejecuta:

```bash
coach --help
```

Esto mostrará la ayuda con todos los comandos y opciones disponibles.

## Ejemplo básico

```bash
coach opinion ruta/archivo.tcx 
```

Esto analizará el archivo y mostrará un resumen en la terminal.

Puedes usar cualquier modelo de Ollama que desees añadiendolo como último parámetro.
```bash
coach opinion ruta/archivo.tcx llama3.2:1b
```

## Funcionalidades principales

- Analiza archivos TCX de actividades deportivas.
- Genera resúmenes y recomendaciones usando IA.