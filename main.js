document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.resolver-opciones button');
    const ecuacionDisplay = document.querySelector('.ecuacion-display .ecuacion');
    const leyendaEcuacion = document.querySelector('.ecuacion-display .leyenda-ecuacion');
    const inputGroups = document.querySelectorAll('.campos-grupo');
    const resultadoDiv = document.getElementById('resultado');
    const resultadoValor = resultadoDiv.querySelector('.resultado-valor');
    const limpiarButton = document.getElementById('limpiar');

    const ecuaciones = {
        velocidad: {
            ecuacion: '<span class="v">V</span> = <span class="d">Δx</span> / <span class="t">Δt</span>',
            leyenda: 'Donde <span class="v">V</span> es la velocidad, <span class="d">Δx</span> es el desplazamiento, y <span class="t">Δt</span> es el tiempo',
            inputs: ['desplazamiento', 'tiempo']
        },
        desplazamiento: {
            ecuacion: '<span class="d">Δx</span> = <span class="v">V</span> * <span class="t">Δt</span>',
            leyenda: 'Donde <span class="d">Δx</span> es el desplazamiento, <span class="v">V</span> es la velocidad, y <span class="t">Δt</span> es el tiempo',
            inputs: ['velocidad', 'tiempo']
        },
        tiempo: {
            ecuacion: '<span class="t">Δt</span> = <span class="d">Δx</span> / <span class="v">V</span>',
            leyenda: 'Donde <span class="t">Δt</span> es el tiempo, <span class="d">Δx</span> es el desplazamiento, y <span class="v">V</span> es la velocidad',
            inputs: ['desplazamiento', 'velocidad']
        }
    };

    const encuentroInputs = {
        distancia: { label: 'Distancia de separación', units: ['m', 'km'] },
        cuerpo1: {
            xi: { label: 'Cuerpo 1: Xi', units: ['m', 'km'] },
            v: { label: 'Cuerpo 1: Velocidad', units: ['m/s', 'km/h'] }
        },
        cuerpo2: {
            xi: { label: 'Cuerpo 2: Xi', units: ['m', 'km'] },
            v: { label: 'Cuerpo 2: Velocidad', units: ['m/s', 'km/h'] }
        }
    };

    function getSignificantFigures(value) {
        if (!isFinite(value)) return 0;
        const match = value.toExponential().match(/e([+-]?\d+)/);
        return match ? value.toString().replace('.', '').replace(/e[+-]?\d+/, '').length : 0;
    }

    function adjustUnits(value, unit) {
        if (unit === 'm' && value >= 1000) {
            return { value: value / 1000, unit: 'km' };
        } else if (unit === 'm/s' && value >= 1000) {
            return { value: value / 1000, unit: 'km/s' };
        }
        return { value, unit };
    }

    function convertirUnidad(valor, unidadOrigen, unidadDestino) {
        if (unidadOrigen === unidadDestino) return valor;
        // m <-> km
        if (unidadOrigen === 'm' && unidadDestino === 'km') return valor / 1000;
        if (unidadOrigen === 'km' && unidadDestino === 'm') return valor * 1000;
        // m/s <-> km/h
        if (unidadOrigen === 'm/s' && unidadDestino === 'km/h') return valor * 3.6;
        if (unidadOrigen === 'km/h' && unidadDestino === 'm/s') return valor / 3.6;
        return valor;
    }

    function calcularEncuentro({d, dUnidad, xi1, xi1Unidad, v1, v1Unidad, xi2, xi2Unidad, v2, v2Unidad, cifras}) {
        // Convertir todo a metros y m/s
        const d_m = convertirUnidad(d, dUnidad, 'm');
        const xi1_m = convertirUnidad(xi1, xi1Unidad, 'm');
        const v1_ms = convertirUnidad(v1, v1Unidad, 'm/s');
        const xi2_m = convertirUnidad(xi2, xi2Unidad, 'm');
        const v2_ms = convertirUnidad(v2, v2Unidad, 'm/s');
        // Ajustar xi2 según distancia de separación
        // Si usuario pone xi1=0 y xi2=d, es directo, si no, se asume separación = xi2-xi1
        // Pero para robustez, forzamos xi2 = xi1 + d_m
        const xi2_m_ajustado = xi1_m + d_m;
        // t = (xi2 - xi1) / (v1 - v2)
        const t = (xi2_m_ajustado - xi1_m) / (v1_ms - v2_ms);
        const x_encuentro = xi1_m + v1_ms * t;
        return {
            t: t,
            x: x_encuentro
        };
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const solveType = button.dataset.solve;
            const { ecuacion, leyenda, inputs } = ecuaciones[solveType];

            ecuacionDisplay.innerHTML = ecuacion;
            leyendaEcuacion.innerHTML = leyenda;

            inputGroups.forEach(group => {
                const label = group.querySelector('label').textContent.trim().toLowerCase();
                group.style.display = inputs.some(input => label.includes(input)) ? 'block' : 'none';
            });            resultadoDiv.style.display = 'none';
        });
    });

    limpiarButton.addEventListener('click', () => {
        document.querySelectorAll('.campos-grupo input').forEach(input => input.value = '');
        resultadoDiv.style.display = 'none';
    });

    document.querySelectorAll('.campos-grupo input').forEach(input => {
        input.addEventListener('input', () => {
            const activeButton = document.querySelector('.resolver-opciones button.active');
            if (!activeButton) return;

            const solveType = activeButton.dataset.solve;
            const { inputs } = ecuaciones[solveType];

            const values = inputs.map(inputType => {
                const group = Array.from(inputGroups).find(group => {
                    const label = group.querySelector('label').textContent.trim().toLowerCase();
                    return label.includes(inputType);
                });
                const inputValue = group ? parseFloat(group.querySelector('input').value) || 0 : 0;
                const significantFigures = getSignificantFigures(inputValue);
                return { value: inputValue, significantFigures };
            });

            const minSignificantFigures = Math.min(...values.map(v => v.significantFigures));

            let result = 0;
            let unit = '';
            if (solveType === 'velocidad') {
                result = values[0].value / values[1].value;
                unit = 'm/s';
            } else if (solveType === 'desplazamiento') {
                result = values[0].value * values[1].value;
                unit = 'm';
            } else if (solveType === 'tiempo') {
                result = values[0].value / values[1].value;
                unit = 's';
            }

            if (!isNaN(result) && isFinite(result)) {
                const adjusted = adjustUnits(result, unit);
                resultadoDiv.style.display = 'block';
                resultadoValor.style.display = 'block';
                resultadoValor.querySelector('.resultado-numero').textContent = adjusted.value.toPrecision(minSignificantFigures).replace('.', ',');
                resultadoValor.querySelector('.resultado-unidad').textContent = adjusted.unit;
            } else {
                resultadoDiv.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.encuentro-grupo input, .encuentro-grupo select').forEach(input => {
        input.addEventListener('input', () => {
            const d = parseFloat(document.getElementById('encuentro-distancia').value.replace(',','.')) || 0;
            const dUnidad = document.getElementById('encuentro-distancia-unidad').value;
            const xi1 = parseFloat(document.getElementById('encuentro-xi1').value.replace(',','.')) || 0;
            const xi1Unidad = document.getElementById('encuentro-xi1-unidad').value;
            const v1 = parseFloat(document.getElementById('encuentro-v1').value.replace(',','.')) || 0;
            const v1Unidad = document.getElementById('encuentro-v1-unidad').value;
            const xi2 = parseFloat(document.getElementById('encuentro-xi2').value.replace(',','.')) || 0;
            const xi2Unidad = document.getElementById('encuentro-xi2-unidad').value;
            const v2 = parseFloat(document.getElementById('encuentro-v2').value.replace(',','.')) || 0;
            const v2Unidad = document.getElementById('encuentro-v2-unidad').value;
            // Cifras significativas mínimas
            const cifras = Math.min(
                getSignificantFigures(d),
                getSignificantFigures(xi1),
                getSignificantFigures(v1),
                getSignificantFigures(xi2),
                getSignificantFigures(v2)
            );
            if (d && v1 !== v2) {
                const { t, x } = calcularEncuentro({d, dUnidad, xi1, xi1Unidad, v1, v1Unidad, xi2, xi2Unidad, v2, v2Unidad, cifras});
                // Mostrar resultado
                const resultadoDiv = document.getElementById('resultado-encuentro');
                resultadoDiv.style.display = 'block';
                resultadoDiv.querySelector('.resultado-tiempo').textContent = t.toPrecision(cifras).replace('.', ',') + ' s';
                resultadoDiv.querySelector('.resultado-posicion').textContent = x.toPrecision(cifras).replace('.', ',') + ' m';
            }
        });
    });
});