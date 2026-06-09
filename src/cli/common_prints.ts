export function help() {
    console.log(`
        Uso: coach <comando> <archivo.tcx> [modelo]
        El parámetro modelo es opcional. Si desas usar un modelo personalizado, 
        pon el nombre del modelo.

        Comandos:
        --help, -h      Muestra esta ayuda
        --version, -v   Muestra la versión
        run         Analiza el archivo TCX y da una opinión usando el modelo
        run --debug Analiza el archivo TCX, da una opinión usando el modelo y muestra información adicional de debug

        Ejemplo:
        coach run actividad.tcx llama3.2:1b  

        Nota:
        Se usan los modelos de Ollama, por lo tanto es necesario tener ollama instalado.
        Instalación de Ollama -> https://ollama.com/
    `);
}