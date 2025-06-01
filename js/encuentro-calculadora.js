import { convertToBaseUnit, convertFromBaseUnit, roundToSignificantDigits } from './utils.js';

// Initialize the Encounter Calculator
export function initEncounterCalculator() {  // Get reference to DOM elements
  const solveButtons = document.querySelectorAll('.calculadora-encuentro .resolver-opciones button');
  const distanciaSeparacionInput = document.getElementById('encuentro-distancia');
  const unidadesDistancia = document.getElementById('encuentro-distancia-unidad');
  const velocidad1Input = document.getElementById('encuentro-v1');
  const unidadesVel1 = document.getElementById('encuentro-v1-unidad');
  const velocidad2Input = document.getElementById('encuentro-v2');
  const unidadesVel2 = document.getElementById('encuentro-v2-unidad');
    const resultadoNumero = document.querySelector('.calculadora-encuentro .resultado-numero');
  const resultadoUnidad = document.querySelector('.calculadora-encuentro .resultado-unidad');
  const tiempoEncuentroSpan = document.getElementById('tiempo-encuentro');
  const posicionEncuentroSpan = document.getElementById('posicion-encuentro');
  const limpiarEncuentroButton = document.getElementById('limpiar-encuentro');
  const resultadoAdicional = document.querySelector('.resultado-adicional');
  
  // Set initial values for the problem
  distanciaSeparacionInput.value = "2.0";
  velocidad1Input.value = "15";
  velocidad2Input.value = "30";
  unidadesDistancia.value = "Km";
  unidadesVel1.value = "Km/h";
  unidadesVel2.value = "Km/h";

  // Current solve mode
  let currentSolveMode = 'tiempo-encuentro';
  // Update encounter calculator UI based on solve mode
  function updateEncounterUI(solveMode) {
    currentSolveMode = solveMode;
    
    // Update button active states
    solveButtons.forEach(button => {
      if (button.dataset.solve === solveMode) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Clear result
    resultadoNumero.textContent = '';
    resultadoUnidad.textContent = '';
    tiempoEncuentroSpan.textContent = '';
    posicionEncuentroSpan.textContent = '';    resultadoAdicional.style.display = 'none';  
  }

  // Calculate the encounter time and position
  function calculateEncounter() {    // Get input values and convert them to base units (metros y m/s)
    const distanciaRaw = distanciaSeparacionInput.value ? 
      parseFloat(distanciaSeparacionInput.value) : null;
    const velocidad1Raw = velocidad1Input.value ? 
      parseFloat(velocidad1Input.value) : null;
    const velocidad2Raw = velocidad2Input.value ? 
      parseFloat(velocidad2Input.value) : null;

    // Check if all inputs are filled
    if (distanciaRaw === null || velocidad1Raw === null || velocidad2Raw === null) {
      return;
    }

    // Convertir todas las unidades a unidades base (m y m/s)
    const distancia = convertToBaseUnit(distanciaRaw, unidadesDistancia.value, 'distance');
    const velocidad1 = convertToBaseUnit(velocidad1Raw, unidadesVel1.value, 'velocity');
    const velocidad2 = convertToBaseUnit(velocidad2Raw, unidadesVel2.value, 'velocity');

    let tiempoEncuentro, posicionEncuentro;
    // Para problemas de alcance (movimiento en la misma dirección):
    // Δt = distancia / (v2 - v1)
    // Si v2 > v1, el tiempo debe ser positivo
    tiempoEncuentro = Math.abs(distancia / (velocidad2 - velocidad1));
    // x = v1 × Δt
    posicionEncuentro = distancia;

    // Validar resultados
    if (tiempoEncuentro < 0) {
      resultadoNumero.textContent = 'El encuentro ocurrió en el pasado';
      resultadoUnidad.textContent = '';
      resultadoAdicional.style.display = 'none';
      return;
    }

    if (!isFinite(tiempoEncuentro)) {
      resultadoNumero.textContent = 'No se encontrarán';
      resultadoUnidad.textContent = '';
      resultadoAdicional.style.display = 'none';
      return;
    }    // Convertir resultados a las unidades seleccionadas
    const tiempoH = tiempoEncuentro / 3600; // Convertir de segundos a horas
    const tiempoRedondeado = roundToSignificantDigits(tiempoH, 3);
    resultadoNumero.textContent = tiempoRedondeado.toFixed(2);
    resultadoUnidad.textContent = 'h';
    
    // Mostrar información adicional
    tiempoEncuentroSpan.textContent = `${tiempoRedondeado.toFixed(2)} h`;
    
    // Convertir la posición de metros a kilómetros y mostrarla
    const posicionKm = convertFromBaseUnit(posicionEncuentro, 'Km', 'distance');
    const posicionRedondeada = roundToSignificantDigits(posicionKm, 3);
    posicionEncuentroSpan.textContent = `${posicionRedondeada.toFixed(2)} km`;
    resultadoAdicional.style.display = 'block';

    // Animación
    const resultadoElem = document.getElementById('resultado-encuentro');
    resultadoElem.style.animation = 'none';
    void resultadoElem.offsetWidth;
    resultadoElem.style.animation = 'slideIn 0.3s ease-out';
  }

  // Add event listeners to solve mode buttons
  solveButtons.forEach(button => {
    button.addEventListener('click', () => {
      updateEncounterUI(button.dataset.solve);
      calculateEncounter(); // Recalculate with new mode
    });
  });
  // Add event listeners to all inputs and selects
  const allInputs = [
    distanciaSeparacionInput, velocidad1Input, velocidad2Input
  ];
  
  const allSelects = [
    unidadesDistancia, unidadesVel1, unidadesVel2
  ];
  
  allInputs.forEach(input => {
    input.addEventListener('input', calculateEncounter);
  });
  
  allSelects.forEach(select => {
    select.addEventListener('change', calculateEncounter);
  });
  // Add event listener to clear button
  limpiarEncuentroButton.addEventListener('click', () => {
    // Limpiar los campos de entrada
    distanciaSeparacionInput.value = '';
    velocidad1Input.value = '';
    velocidad2Input.value = '';
    
    // Restablecer las unidades a los valores por defecto
    unidadesDistancia.value = 'Km';
    unidadesVel1.value = 'Km/h';
    unidadesVel2.value = 'Km/h';
    
    // Limpiar los resultados
    resultadoNumero.textContent = '';
    resultadoUnidad.textContent = '';
    tiempoEncuentroSpan.textContent = '';
    posicionEncuentroSpan.textContent = '';
    resultadoAdicional.style.display = 'none';
    
    // Actualizar la UI
    updateEncounterUI(currentSolveMode);
  });

  // Initial UI setup
  updateEncounterUI('tiempo-encuentro');
}