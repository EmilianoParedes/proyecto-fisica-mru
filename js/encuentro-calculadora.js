/**
 * Calculadora de problemas de encuentro para Movimiento Rectilíneo Uniforme (MRU)
 */

import { convertToBaseUnit, convertFromBaseUnit, getMinSignificantDigits, formatNumber } from './utils.js';

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
  const graficoContainer = document.getElementById('grafico-container');
  const graficoCanvas = document.getElementById('grafico-encuentro');
  const ctx = graficoCanvas.getContext('2d');
  const resultadoAdicional = document.querySelector('#resultado-encuentro .resultado-adicional');
  const resultadoMensaje = document.querySelector('#resultado-encuentro .resultado-mensaje');


  // Calculate encounter and return data object, or null if not possible
  function getEncounterData() {
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

    if (v1Base !== null && v2Base !== null && v1Base !== v2Base) {
      let x2Base;
      if (xi2Base !== null) {
        x2Base = xi2Base;
      } else if (distanciaBase !== null) {
        x2Base = xi1Base + distanciaBase;
      } else {
        return null;
      }

      const tiempoEncuentro = (x2Base - xi1Base) / (v1Base - v2Base);
      const posicionEncuentro = xi1Base + (v1Base * tiempoEncuentro);

      if (tiempoEncuentro >= 0) { // Allow encounters at t=0
        const sigDigits = Math.max(2, getMinSignificantDigits(distancia, xi1, v1, xi2, v2));
        return { xi1Base, v1Base, xi2Base: x2Base, v2Base, tiempoEncuentro, posicionEncuentro, sigDigits, xi1Unit, distanciaUnit, xi2Unit };
      }
    }
    return null;
  }

  // Display text results
  function displayResults(data) {
    if (!data) {
        resultadoEncuentro.style.display = 'block';
        resultadoAdicional.style.display = 'none';
        
        resultadoMensaje.textContent = 'Los datos ingresados no producen un encuentro futuro.';
        resultadoMensaje.style.display = 'block';

        resultadoEncuentro.style.animation = 'none';
        void resultadoEncuentro.offsetWidth;
        resultadoEncuentro.style.animation = 'slideIn 0.3s ease-out';
        return;
    }

    resultadoMensaje.style.display = 'none';
    resultadoAdicional.style.display = 'block';

    const { tiempoEncuentro, posicionEncuentro, sigDigits, distanciaUnit, xi1Unit, xi2Unit } = data;
    let tiempoDisplay, posicionDisplay;

    if (distanciaUnit === 'Km' || xi1Unit === 'Km' || xi2Unit === 'Km') {
      tiempoDisplay = `${formatNumber(tiempoEncuentro / 3600, sigDigits)} h`;
      posicionDisplay = `${formatNumber(posicionEncuentro / 1000, sigDigits)} km`;
    } else {
      if (tiempoEncuentro < 60) {
        tiempoDisplay = `${formatNumber(tiempoEncuentro, sigDigits)} s`;
      } else if (tiempoEncuentro < 3600) {
        tiempoDisplay = `${formatNumber(tiempoEncuentro / 60, sigDigits)} min`;
      } else {
        tiempoDisplay = `${formatNumber(tiempoEncuentro / 3600, sigDigits)} h`;
      }
      posicionDisplay = `${formatNumber(posicionEncuentro, sigDigits)} m`;
    }

    resultadoEncuentro.style.display = 'block';
    tiempoEncuentroSpan.textContent = tiempoDisplay;
    posicionEncuentroSpan.textContent = posicionDisplay;
    resultadoEncuentro.style.animation = 'none';
    void resultadoEncuentro.offsetWidth;
    resultadoEncuentro.style.animation = 'slideIn 0.3s ease-out';
  }

  // Draw the graph on the canvas
  function drawGraph(data) {
    const { xi1Base, xi2Base, tiempoEncuentro, posicionEncuentro, xi1Unit } = data;
    const canvas = ctx.canvas;
    const padding = 50;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '12px "Playpen Sans Arabic", cursive';
    ctx.fillStyle = '#4A3728';
    ctx.textAlign = 'center';

    const tMax = tiempoEncuentro * 1.2 || 1;
    const allPos = [xi1Base, xi2Base, posicionEncuentro];
    const yRange = Math.max(...allPos) - Math.min(...allPos);
    const yMin = Math.min(...allPos) - yRange * 0.1;
    const yMax = Math.max(...allPos) + yRange * 0.1;
    const finalYMin = yRange === 0 ? yMin - 1 : yMin;
    const finalYMax = yRange === 0 ? yMax + 1 : yMax;

    const mapX = (t) => padding + (t / tMax) * (canvas.width - 2 * padding);
    const mapY = (pos) => (canvas.height - padding) - ((pos - finalYMin) / (finalYMax - finalYMin)) * (canvas.height - 2 * padding);

    ctx.beginPath();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    const posUnit = (xi1Unit === 'Km') ? 'Km' : 'm';
    const timeUnit = (tiempoEncuentro > 3600 && posUnit === 'Km') ? 'h' : 's';
    ctx.fillText(`Tiempo (${timeUnit})`, canvas.width / 2, canvas.height - 15);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Posición (${posUnit})`, -canvas.height / 2, 15);
    ctx.restore();

    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const t = (tMax / 5) * i;
        const x = mapX(t);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - padding);
        ctx.lineTo(x, canvas.height - padding + 5);
        ctx.stroke();
        let tLabel = (timeUnit === 'h') ? (t / 3600).toFixed(2) : t.toFixed(1);
        ctx.fillText(String(tLabel).replace('.',','), x, canvas.height - padding + 20);
    }
    
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const pos = finalYMin + ((finalYMax - finalYMin) / 5) * i;
        const y = mapY(pos);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding - 5, y);
        ctx.stroke();
        let pLabel = (posUnit === 'Km') ? (pos / 1000).toFixed(2) : pos.toFixed(1);
        ctx.fillText(String(pLabel).replace('.',','), padding - 10, y + 4);
    }
    ctx.textAlign = 'center';

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.moveTo(mapX(0), mapY(xi1Base));
    ctx.lineTo(mapX(tiempoEncuentro), mapY(posicionEncuentro));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.moveTo(mapX(0), mapY(xi2Base));
    ctx.lineTo(mapX(tiempoEncuentro), mapY(posicionEncuentro));
    ctx.stroke();
    
    ctx.beginPath();
    ctx.fillStyle = 'purple';
    ctx.arc(mapX(tiempoEncuentro), mapY(posicionEncuentro), 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = 'blue';
    ctx.fillRect(canvas.width - padding - 90, padding - 15, 10, 10);
    ctx.fillStyle = '#4A3728';
    ctx.fillText('Cuerpo 1', canvas.width - padding - 75, padding - 7);
    
    ctx.fillStyle = 'red';
    ctx.fillRect(canvas.width - padding - 90, padding + 5, 10, 10);
    ctx.fillStyle = '#4A3728';
    ctx.fillText('Cuerpo 2', canvas.width - padding - 75, padding + 13);
  }

  // Main calculation and display logic
  function handleCalculation() {
    const activebutton = document.querySelector('#resolver-encuentro-opciones button.active');
    if (activebutton && activebutton.dataset.solve !== 'graficar') {
        const data = getEncounterData();
        displayResults(data);
    }
  }

  // Event Listeners
  encounterButtons.forEach(button => {
    button.addEventListener('click', () => {
      encounterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const action = button.dataset.solve;
      const data = getEncounterData();

      if (action === 'graficar') {
        if (data) {
          drawGraph(data);
          graficoContainer.style.display = 'block';
          resultadoEncuentro.style.display = 'none';
        } else {
          graficoContainer.style.display = 'none';
          displayResults(null);
        }
      } else {
        graficoContainer.style.display = 'none';
        displayResults(data);
      }
    });
  });

  [distanciaInput, xi1Input, v1Input, xi2Input, v2Input, distanciaUnits, xi1Units, v1Units, xi2Units, v2Units].forEach(el => {
    el.addEventListener('input', handleCalculation);
  });

  limpiarEncuentroButton.addEventListener('click', () => {
    distanciaInput.value = '';
    xi1Input.value = '0';
    v1Input.value = '';
    xi2Input.value = '';
    v2Input.value = '';
    resultadoEncuentro.style.display = 'none';
    graficoContainer.style.display = 'none';
  });

  xi1Input.value = '0';
}