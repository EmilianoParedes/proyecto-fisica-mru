import { convertToBaseUnit, convertFromBaseUnit, roundToSignificantDigits } from './utils.js';

// Initialize the Encounter Calculator
export function initEncounterCalculator() {
  // Get reference to DOM elements
  const solveButtons = document.querySelectorAll('.calculadora-encuentro .resolver-opciones button');
  const distanciaSeparacionInput = document.getElementById('distancia-separacion');
  const unidadesDistancia = document.getElementById('unidades-distancia');
  
  const posInicial1Input = document.getElementById('pos-inicial-1');
  const unidadesPos1 = document.getElementById('unidades-pos-1');
  const velocidad1Input = document.getElementById('velocidad-1');
  const unidadesVel1 = document.getElementById('unidades-vel-1');
  
  const posInicial2Input = document.getElementById('pos-inicial-2');
  const unidadesPos2 = document.getElementById('unidades-pos-2');
  const velocidad2Input = document.getElementById('velocidad-2');
  const unidadesVel2 = document.getElementById('unidades-vel-2');
  
  const resultadoNumero = document.querySelector('.calculadora-encuentro .resultado-numero');
  const resultadoUnidad = document.querySelector('.calculadora-encuentro .resultado-unidad');
  const tiempoEncuentroSpan = document.getElementById('tiempo-encuentro');
  const posicionEncuentroSpan = document.getElementById('posicion-encuentro');
  const limpiarEncuentroButton = document.getElementById('limpiar-encuentro');
  const resultadoAdicional = document.querySelector('.resultado-adicional');

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
    posicionEncuentroSpan.textContent = '';
    
    // Show or hide additional result info
    resultadoAdicional.style.display = 'none';
  }

  // Calculate the encounter time and position
  function calculateEncounter() {
    // Get input values
    const distanciaSeparacion = distanciaSeparacionInput.value ? 
      parseFloat(distanciaSeparacionInput.value) : null;
    const posInicial1 = posInicial1Input.value ? 
      parseFloat(posInicial1Input.value) : null;
    const velocidad1 = velocidad1Input.value ? 
      parseFloat(velocidad1Input.value) : null;
    const posInicial2 = posInicial2Input.value ? 
      parseFloat(posInicial2Input.value) : null;
    const velocidad2 = velocidad2Input.value ? 
      parseFloat(velocidad2Input.value) : null;

    // Check if all inputs are filled
    if (distanciaSeparacion === null || posInicial1 === null || velocidad1 === null || 
        posInicial2 === null || velocidad2 === null) {
      return;
    }

    // Get selected units
    const distanciaUnit = unidadesDistancia.value;
    const pos1Unit = unidadesPos1.value;
    const vel1Unit = unidadesVel1.value;
    const pos2Unit = unidadesPos2.value;
    const vel2Unit = unidadesVel2.value;

    // Convert all values to base units (m, m/s)
    const distanciaBase = convertToBaseUnit(distanciaSeparacion, distanciaUnit, 'distance');
    const posInicial1Base = convertToBaseUnit(posInicial1, pos1Unit, 'distance');
    const velocidad1Base = convertToBaseUnit(velocidad1, vel1Unit, 'velocity');
    const posInicial2Base = convertToBaseUnit(posInicial2, pos2Unit, 'distance');
    const velocidad2Base = convertToBaseUnit(velocidad2, vel2Unit, 'velocity');

    // Calculate relative velocity
    const velocidadRelativa = velocidad2Base - velocidad1Base;

    // Check if they will never meet (same velocity, different positions)
    if (velocidadRelativa === 0 && posInicial1Base !== posInicial2Base) {
      resultadoNumero.textContent = 'No se encontrarán';
      resultadoUnidad.textContent = '';
      return;
    }

    // Calculate time of encounter (in seconds)
    const tiempoEncuentroBase = (posInicial1Base - posInicial2Base) / velocidadRelativa;

    // Check if they will meet in the future
    if (tiempoEncuentroBase < 0) {
      resultadoNumero.textContent = 'Se encontraron en el pasado';
      resultadoUnidad.textContent = '';
      return;
    }

    // Calculate position of encounter (in meters)
    const posicionEncuentroBase = posInicial1Base + (velocidad1Base * tiempoEncuentroBase);

    // Convert results back to selected units
    let tiempoEncuentro, posicionEncuentro;
    let tiempoUnit, posicionUnit;

    if (currentSolveMode === 'tiempo-encuentro') {
      // For tiempo-encuentro mode, show time as main result
      tiempoUnit = 's'; // Default to seconds for main result
      tiempoEncuentro = tiempoEncuentroBase;
      
      // Convert for additional display with specified unit
      const tiempoEncuentroConverted = convertFromBaseUnit(
        tiempoEncuentroBase, 
        document.getElementById('unidades-tiempo').value, 
        'time'
      );
      posicionEncuentro = convertFromBaseUnit(posicionEncuentroBase, distanciaUnit, 'distance');
      posicionUnit = distanciaUnit;
      
      // Display main result
      resultadoNumero.textContent = roundToSignificantDigits(tiempoEncuentro, 4);
      resultadoUnidad.textContent = tiempoUnit;
      
      // Display additional info
      tiempoEncuentroSpan.textContent = `${roundToSignificantDigits(tiempoEncuentroConverted, 4)} ${document.getElementById('unidades-tiempo').value}`;
      posicionEncuentroSpan.textContent = `${roundToSignificantDigits(posicionEncuentro, 4)} ${posicionUnit}`;
    } else {
      // For punto-encuentro mode, show position as main result
      posicionUnit = distanciaUnit;
      posicionEncuentro = convertFromBaseUnit(posicionEncuentroBase, posicionUnit, 'distance');
      
      // Convert for additional display
      tiempoEncuentro = convertFromBaseUnit(
        tiempoEncuentroBase, 
        document.getElementById('unidades-tiempo').value, 
        'time'
      );
      tiempoUnit = document.getElementById('unidades-tiempo').value;
      
      // Display main result
      resultadoNumero.textContent = roundToSignificantDigits(posicionEncuentro, 4);
      resultadoUnidad.textContent = posicionUnit;
      
      // Display additional info
      tiempoEncuentroSpan.textContent = `${roundToSignificantDigits(tiempoEncuentro, 4)} ${tiempoUnit}`;
      posicionEncuentroSpan.textContent = `${roundToSignificantDigits(posicionEncuentro, 4)} ${posicionUnit}`;
    }

    // Show additional results
    resultadoAdicional.style.display = 'block';
    
    // Add animation
    const resultadoElem = document.getElementById('resultado-encuentro');
    resultadoElem.style.animation = 'none';
    // Trigger reflow
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
    distanciaSeparacionInput, posInicial1Input, velocidad1Input, 
    posInicial2Input, velocidad2Input
  ];
  
  const allSelects = [
    unidadesDistancia, unidadesPos1, unidadesVel1, 
    unidadesPos2, unidadesVel2
  ];
  
  allInputs.forEach(input => {
    input.addEventListener('input', calculateEncounter);
  });
  
  allSelects.forEach(select => {
    select.addEventListener('change', calculateEncounter);
  });

  // Add event listener to clear button
  limpiarEncuentroButton.addEventListener('click', () => {
    allInputs.forEach(input => {
      input.value = '';
    });
    
    // Clear results
    resultadoNumero.textContent = '';
    resultadoUnidad.textContent = '';
    tiempoEncuentroSpan.textContent = '';
    posicionEncuentroSpan.textContent = '';
    resultadoAdicional.style.display = 'none';
  });

  // Initial UI setup
  updateEncounterUI('tiempo-encuentro');
}