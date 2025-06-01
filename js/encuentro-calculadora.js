/**
 * Calculadora de problemas de encuentro para Movimiento Rectilíneo Uniforme (MRU)
 */

import { convertToBaseUnit, convertFromBaseUnit, roundToSignificantDigits, getMinSignificantDigits, formatNumber } from './utils.js';

export function initEncounterCalculator() {
  // DOM Elements
  const encounterButtons = document.querySelectorAll('#resolver-encuentro-opciones button');
  const distanciaInput = document.getElementById('encuentro-distancia');
  const distanciaUnits = document.getElementById('encuentro-distancia-unidad');
  const xi1Input = document.getElementById('encuentro-xi1');
  const xi1Units = document.getElementById('encuentro-xi1-unidad');
  const v1Input = document.getElementById('encuentro-v1');
  const v1Units = document.getElementById('encuentro-v1-unidad');
  const xi2Input = document.getElementById('encuentro-xi2');
  const xi2Units = document.getElementById('encuentro-xi2-unidad');
  const v2Input = document.getElementById('encuentro-v2');
  const v2Units = document.getElementById('encuentro-v2-unidad');
  const resultadoEncuentro = document.getElementById('resultado-encuentro');
  const tiempoEncuentroSpan = document.getElementById('tiempo-encuentro');
  const posicionEncuentroSpan = document.getElementById('posicion-encuentro');
  const limpiarEncuentroButton = document.getElementById('limpiar-encuentro');

  // Current solve mode (tiempo-encuentro or punto-encuentro)
  let currentEncounterSolveMode = 'tiempo-encuentro';

  // Calculate encounter for two bodies in MRU
  function calculateEncounter() {
    // Get input values
    const distancia = distanciaInput.value ? parseFloat(distanciaInput.value) : null;
    const xi1 = xi1Input.value ? parseFloat(xi1Input.value) : 0;
    const v1 = v1Input.value ? parseFloat(v1Input.value) : null;
    const xi2 = xi2Input.value ? parseFloat(xi2Input.value) : null;
    const v2 = v2Input.value ? parseFloat(v2Input.value) : null;

    // Get units
    const distanciaUnit = distanciaUnits.value;
    const xi1Unit = xi1Units.value;
    const v1Unit = v1Units.value;
    const xi2Unit = xi2Units.value;
    const v2Unit = v2Units.value;

    // Convert to base units (meters and m/s)
    const distanciaBase = distancia !== null ? convertToBaseUnit(distancia, distanciaUnit, 'distance') : null;
    const xi1Base = convertToBaseUnit(xi1, xi1Unit, 'distance');
    const v1Base = v1 !== null ? convertToBaseUnit(v1, v1Unit, 'velocity') : null;
    const xi2Base = xi2 !== null ? convertToBaseUnit(xi2, xi2Unit, 'distance') : null;
    const v2Base = v2 !== null ? convertToBaseUnit(v2, v2Unit, 'velocity') : null;

    // If all required values are present and the velocities are different
    if (v1Base !== null && v2Base !== null && v1Base !== v2Base) {
      let x2Base;
      
      // If xi2 is provided, use it. Otherwise, calculate based on distance
      if (xi2Base !== null) {
        x2Base = xi2Base;
      } else if (distanciaBase !== null) {
        // Assume the second body is at distance from the first body
        x2Base = xi1Base + distanciaBase;
      } else {
        // Not enough information
        return;
      }

      // Calculate time of encounter: t = (x2 - x1) / (v1 - v2)
      const tiempoEncuentro = (x2Base - xi1Base) / (v1Base - v2Base);
      
      // Calculate position of encounter: x = x1 + v1*t
      const posicionEncuentro = xi1Base + (v1Base * tiempoEncuentro);

      // Get minimum number of significant digits from inputs
      const sigDigits = Math.max(2, getMinSignificantDigits(distancia, xi1, v1, xi2, v2));
      
      // Only show results if time is positive (future encounter)
      if (tiempoEncuentro > 0) {
        let tiempoDisplay, posicionDisplay;
        
        // If working with kilometers, show time in hours
        if (distanciaUnit === 'Km' || xi1Unit === 'Km' || xi2Unit === 'Km') {
          const tiempoHoras = tiempoEncuentro / 3600;
          tiempoDisplay = `${formatNumber(tiempoHoras, sigDigits)} h`;
          
          // Show position in kilometers
          const posicionKm = posicionEncuentro / 1000;
          posicionDisplay = `${formatNumber(posicionKm, sigDigits)} km`;
        } else {
          // For meters, use appropriate time unit based on duration
          if (tiempoEncuentro < 60) {
            tiempoDisplay = `${formatNumber(tiempoEncuentro, sigDigits)} s`;
          } else if (tiempoEncuentro < 3600) {
            tiempoDisplay = `${formatNumber(tiempoEncuentro / 60, sigDigits)} min`;
          } else {
            tiempoDisplay = `${formatNumber(tiempoEncuentro / 3600, sigDigits)} h`;
          }
          
          // Show position in meters
          posicionDisplay = `${formatNumber(posicionEncuentro, sigDigits)} m`;
        }
        
        // Show results
        resultadoEncuentro.style.display = 'block';
        tiempoEncuentroSpan.textContent = tiempoDisplay;
        posicionEncuentroSpan.textContent = posicionDisplay;
        
        // Add animation
        resultadoEncuentro.style.animation = 'none';
        void resultadoEncuentro.offsetWidth;
        resultadoEncuentro.style.animation = 'slideIn 0.3s ease-out';
      } else {
        // No future encounter (time is negative)
        resultadoEncuentro.style.display = 'none';
      }
    } else {
      // Not enough information
      resultadoEncuentro.style.display = 'none';
    }
  }

  // Add event listeners
  
  // Handle solve mode buttons
  encounterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      encounterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update current solve mode
      currentEncounterSolveMode = button.dataset.solve;
      
      // Recalculate
      calculateEncounter();
    });
  });

  // Add event listeners to all inputs
  [distanciaInput, xi1Input, v1Input, xi2Input, v2Input].forEach(input => {
    input.addEventListener('input', calculateEncounter);
  });

  // Add event listeners to all unit selectors
  [distanciaUnits, xi1Units, v1Units, xi2Units, v2Units].forEach(select => {
    select.addEventListener('change', calculateEncounter);
  });

  // Clear button functionality
  limpiarEncuentroButton.addEventListener('click', () => {
    distanciaInput.value = '';
    xi1Input.value = '';
    v1Input.value = '';
    xi2Input.value = '';
    v2Input.value = '';
    resultadoEncuentro.style.display = 'none';
  });

  // Initial setup: Auto-fill typical values
  xi1Input.value = '0'; // Starting position of first body is usually 0

  // Helper function for updating xi2 based on distance
  function updateXi2FromDistance() {
    if (distanciaInput.value && !xi2Input.value) {
      // If distance is set but xi2 is not, auto-calculate xi2
      const distance = parseFloat(distanciaInput.value);
      if (!isNaN(distance)) {
        if (distanciaUnits.value === xi2Units.value) {
          // If units match, just add the distance
          xi2Input.value = distance;
        } else {
          // Convert units if needed
          const distanceBase = convertToBaseUnit(distance, distanciaUnits.value, 'distance');
          const xi2 = convertFromBaseUnit(distanceBase, xi2Units.value, 'distance');
          xi2Input.value = xi2;
        }
      }
    }
  }

  // Update xi2 when distance changes
  distanciaInput.addEventListener('input', updateXi2FromDistance);
  distanciaUnits.addEventListener('change', updateXi2FromDistance);
}