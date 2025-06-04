// Importar los módulos necesarios
import { initMRUCalculator } from '/js/mru-calculadora.js';
import { initEncounterCalculator } from '/js/encuentro-calculadora.js';

// Inicializar las calculadoras cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    initMRUCalculator();
    initEncounterCalculator();
});
