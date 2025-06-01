/**
 * Calculadora de Movimiento Rectilíneo Uniforme (MRU)
 */

import { convertToBaseUnit, convertFromBaseUnit, roundToSignificantDigits, getMinSignificantDigits, formatNumber } from './utils.js';

// Initialize the MRU Calculator
export function initMRUCalculator() {
  // Get reference to DOM elements
  const solveButtons = document.querySelectorAll('.calculadora .resolver-opciones button');
  const desplazamientoInput = document.getElementById('desplazamiento-input');
  const desplazamientoUnits = document.getElementById('unidades-desplazamiento');
  const velocidadInput = document.getElementById('velocidad-input');
  const velocidadUnits = document.getElementById('unidades-velocidad');
  const tiempoInput = document.getElementById('tiempo-input');
  const tiempoUnits = document.getElementById('unidades-tiempo');
  const resultadoDiv = document.getElementById('resultado');
  const resultadoNumero = document.querySelector('.resultado-numero');
  const resultadoUnidad = document.querySelector('.resultado-unidad');
  const limpiarButton = document.getElementById('limpiar');
  const ecuacionDisplay = document.querySelector('.ecuacion');
  const leyendaEcuacion = document.querySelector('.leyenda-ecuacion');
  const camposGrupo = document.querySelectorAll('.calculadora .campos-grupo');

  let currentSolveMode = 'velocidad';

  // Actualizar la ecuación y texto según el modo de resolución
  function updateEquation(solveMode) {
    switch (solveMode) {
      case 'velocidad':
        ecuacionDisplay.innerHTML = `
          <span class="v">V</span>
          <span> = </span>
          <span class="d">Δx</span>
          <span> / </span>
          <span class="t">Δt</span>
        `;
        leyendaEcuacion.innerHTML = 'Donde <span class="v">V</span> es la velocidad, <span class="d">Δx</span> es el desplazamiento, y <span class="t">Δt</span> es el tiempo';
        break;
      case 'desplazamiento':
        ecuacionDisplay.innerHTML = `
          <span class="d">Δx</span>
          <span> = </span>
          <span class="v">V</span>
          <span> × </span>
          <span class="t">Δt</span>
        `;
        leyendaEcuacion.innerHTML = 'Donde <span class="d">Δx</span> es el desplazamiento, <span class="v">V</span> es la velocidad, y <span class="t">Δt</span> es el tiempo';
        break;
      case 'tiempo':
        ecuacionDisplay.innerHTML = `
          <span class="t">Δt</span>
          <span> = </span>
          <span class="d">Δx</span>
          <span> / </span>
          <span class="v">V</span>
        `;
        leyendaEcuacion.innerHTML = 'Donde <span class="t">Δt</span> es el tiempo, <span class="d">Δx</span> es el desplazamiento, y <span class="v">V</span> es la velocidad';
        break;
    }
  }

  // Actualizar la interfaz de usuario de la calculadora según el modo de resolución seleccionado
  function updateCalculatorUI(solveMode) {
    currentSolveMode = solveMode;
    
    // Update button active states
    solveButtons.forEach(button => {
      if (button.dataset.solve === solveMode) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    // Actualizar la ecuación y leyenda
    updateEquation(solveMode);

    // Mostrar/ocultar campos de entrada según el modo de resolución
    camposGrupo.forEach(grupo => {
      const input = grupo.querySelector('input');
      const label = grupo.querySelector('label').textContent.toLowerCase();

      if (
        (solveMode === 'velocidad' && label.includes('velocidad')) ||
        (solveMode === 'desplazamiento' && label.includes('desplazamiento')) ||
        (solveMode === 'tiempo' && label.includes('tiempo'))
      ) {
        grupo.style.display = 'none';
      } else {
        grupo.style.display = 'flex';
      }
    });

    // Limpiar los campos de entrada
    resultadoDiv.style.display = 'none';
  }

  // Calculate the result based on inputs and solve mode
  function calculate() {
    // Get input values
    const desplazamiento = desplazamientoInput.value ? parseFloat(desplazamientoInput.value) : null;
    const velocidad = velocidadInput.value ? parseFloat(velocidadInput.value) : null;
    const tiempo = tiempoInput.value ? parseFloat(tiempoInput.value) : null;

    // Get selected units
    const desplazamientoUnit = desplazamientoUnits.value;
    const velocidadUnit = velocidadUnits.value;
    const tiempoUnit = tiempoUnits.value;

    // Convert inputs to base units (m, m/s, s)
    const desplazamientoBase = desplazamiento !== null ? 
      convertToBaseUnit(desplazamiento, desplazamientoUnit, 'distance') : null;
    const velocidadBase = velocidad !== null ? 
      convertToBaseUnit(velocidad, velocidadUnit, 'velocity') : null;
    const tiempoBase = tiempo !== null ? 
      convertToBaseUnit(tiempo, tiempoUnit, 'time') : null;

    let result, resultUnit;

    // Calculate based on solve mode
    switch (currentSolveMode) {
      case 'velocidad':
        if (desplazamientoBase !== null && tiempoBase !== null && tiempoBase !== 0) {
          result = desplazamientoBase / tiempoBase;
          resultUnit = velocidadUnit;
        }
        break;

      case 'desplazamiento':
        if (velocidadBase !== null && tiempoBase !== null) {
          result = velocidadBase * tiempoBase;
          resultUnit = desplazamientoUnit;
        }
        break;

      case 'tiempo':
        if (desplazamientoBase !== null && velocidadBase !== null && velocidadBase !== 0) {
          result = desplazamientoBase / velocidadBase;
          resultUnit = tiempoUnit;
        }
        break;
    }

    // Display result if we have a valid calculation
    if (result !== undefined && !isNaN(result)) {
      // Convert from base units back to selected units
      let displayResult;
      
      switch (currentSolveMode) {
        case 'velocidad':
          displayResult = convertFromBaseUnit(result, resultUnit, 'velocity');
          break;
        case 'desplazamiento':
          displayResult = convertFromBaseUnit(result, resultUnit, 'distance');
          break;
        case 'tiempo':
          displayResult = convertFromBaseUnit(result, resultUnit, 'time');
          break;
      }
      
      // Get minimum significant digits from inputs
      const sigDigits = getMinSignificantDigits(desplazamiento, velocidad, tiempo);
      
      // Format the result
      resultadoNumero.textContent = formatNumber(displayResult, sigDigits);
      resultadoUnidad.textContent = resultUnit;
      resultadoDiv.style.display = 'block';

      // Add animation
      resultadoDiv.style.animation = 'none';
      void resultadoDiv.offsetWidth;
      resultadoDiv.style.animation = 'slideIn 0.3s ease-out';
    } else {
      resultadoDiv.style.display = 'none';
    }
  }

  // Add event listeners to buttons
  solveButtons.forEach(button => {
    button.addEventListener('click', () => {
      updateCalculatorUI(button.dataset.solve);
      calculate();
    });
  });

  // Add event listeners to inputs
  [desplazamientoInput, velocidadInput, tiempoInput].forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Add event listeners to unit selectors
  [desplazamientoUnits, velocidadUnits, tiempoUnits].forEach(select => {
    select.addEventListener('change', calculate);
  });

  // Add event listener to clear button
  limpiarButton.addEventListener('click', () => {
    desplazamientoInput.value = '';
    velocidadInput.value = '';
    tiempoInput.value = '';
    updateCalculatorUI(currentSolveMode);
  });

  // Initial UI setup
  updateCalculatorUI('velocidad');
}