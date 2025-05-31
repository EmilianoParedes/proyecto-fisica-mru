import { convertToBaseUnit, convertFromBaseUnit, roundToSignificantDigits } from './utils.js';

// Initialize the MRU Calculator
export function initMRUCalculator() {
  // Get reference to DOM elements
  const solveButtons = document.querySelectorAll('.calculadora .resolver-opciones button');
  const desplazamientoInput = document.querySelector('.calculadora .campos-grupo:nth-child(1) input');
  const desplazamientoUnits = document.getElementById('unidades-desplazamiento');
  const velocidadInput = document.querySelector('.calculadora .campos-grupo:nth-child(2) input');
  const velocidadUnits = document.getElementById('unidades-velocidad');
  const tiempoInput = document.querySelector('.calculadora .campos-grupo:nth-child(3) input');
  const tiempoUnits = document.getElementById('unidades-tiempo');
  const resultadoNumero = document.querySelector('.calculadora .resultado-numero');
  const resultadoUnidad = document.querySelector('.calculadora .resultado-unidad');
  const limpiarButton = document.getElementById('limpiar');
  const ecuacionDisplay = document.querySelector('.ecuacion');
  const camposGrupo = document.querySelectorAll('.calculadora .campos-grupo');

  // Add IDs to inputs for better identification
  desplazamientoInput.id = 'desplazamiento-input';
  velocidadInput.id = 'velocidad-input';
  tiempoInput.id = 'tiempo-input';

  // Current solve mode
  let currentSolveMode = 'velocidad';

  // Update equation display based on solve mode
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
        break;
      case 'desplazamiento':
        ecuacionDisplay.innerHTML = `
          <span class="d">Δx</span>
          <span> = </span>
          <span class="v">V</span>
          <span> × </span>
          <span class="t">Δt</span>
        `;
        break;
      case 'tiempo':
        ecuacionDisplay.innerHTML = `
          <span class="t">Δt</span>
          <span> = </span>
          <span class="d">Δx</span>
          <span> / </span>
          <span class="v">V</span>
        `;
        break;
    }
  }

  // Update calculator UI based on solve mode
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

    // Update equation display
    updateEquation(solveMode);

    // Show/hide input fields based on solve mode
    camposGrupo.forEach(grupo => {
      const input = grupo.querySelector('input');
      const label = grupo.querySelector('label').textContent.toLowerCase();

      if (
        (solveMode === 'velocidad' && label.includes('velocidad')) ||
        (solveMode === 'desplazamiento' && label.includes('desplazamiento')) ||
        (solveMode === 'tiempo' && label.includes('tiempo'))
      ) {
        grupo.style.display = 'none';
        input.disabled = true;
        input.value = '';
      } else {
        grupo.style.display = 'flex';
        input.disabled = false;
      }
    });

    // Clear result
    resultadoNumero.textContent = '';
    resultadoUnidad.textContent = '';
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
          result = convertFromBaseUnit(result, resultUnit, 'velocity');
        }
        break;

      case 'desplazamiento':
        if (velocidadBase !== null && tiempoBase !== null) {
          result = velocidadBase * tiempoBase;
          resultUnit = desplazamientoUnit;
          result = convertFromBaseUnit(result, resultUnit, 'distance');
        }
        break;

      case 'tiempo':
        if (desplazamientoBase !== null && velocidadBase !== null && velocidadBase !== 0) {
          result = desplazamientoBase / velocidadBase;
          resultUnit = tiempoUnit;
          result = convertFromBaseUnit(result, resultUnit, 'time');
        }
        break;
    }

    // Display result
    if (result !== undefined) {
      const roundedResult = roundToSignificantDigits(result, 4);
      resultadoNumero.textContent = roundedResult;
      resultadoUnidad.textContent = resultUnit;

      // Add animation
      const resultadoElem = document.getElementById('resultado');
      resultadoElem.style.animation = 'none';
      void resultadoElem.offsetWidth;
      resultadoElem.style.animation = 'slideIn 0.3s ease-out';
    } else {
      resultadoNumero.textContent = '';
      resultadoUnidad.textContent = '';
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
    resultadoNumero.textContent = '';
    resultadoUnidad.textContent = '';
    updateCalculatorUI(currentSolveMode);
  });

  // Initial UI setup
  updateCalculatorUI('velocidad');
}