document.addEventListener("DOMContentLoaded", function () {
    // Seleccionar elementos del DOM
    const resolverBotones = document.querySelectorAll(
        ".resolver-opciones button"
    );
    const ecuacionSpan = document.querySelector(".ecuacion");
    const leyendaEcuacion = document.querySelector(".leyenda-ecuacion");
    const camposGrupo = document.querySelectorAll(".campos-grupo");

    // Función para actualizar la ecuación según el botón seleccionado
    function actualizarEcuacion(tipoCalculo) {
        switch (tipoCalculo) {
            case "velocidad":
                ecuacionSpan.innerHTML = `
                    <span class="v">V</span>
                    <span> = </span>
                    <span class="d">Δx</span>
                    <span> / </span>
                    <span class="t">Δt</span>
                `;
                leyendaEcuacion.innerHTML = `
                    Donde <span class="v">(V)</span> es la velocidad,
                    <span class="d">(Δx)</span> es el desplazamiento, y
                    <span class="t">(Δt)</span> es el tiempo
                `;
                break;
            case "desplazamiento":
                ecuacionSpan.innerHTML = `
                    <span class="d">Δx</span>
                    <span> = </span>
                    <span class="v">V</span>
                    <span> × </span>
                    <span class="t">Δt</span>
                `;
                leyendaEcuacion.innerHTML = `
                    Donde <span class="d">(Δx)</span> es el desplazamiento,
                    <span class="v">(V)</span> es la velocidad, y
                    <span class="t">(Δt)</span> es el tiempo
                `;
                break;
            case "tiempo":
                ecuacionSpan.innerHTML = `
                    <span class="t">Δt</span>
                    <span> = </span>
                    <span class="d">Δx</span>
                    <span> / </span>
                    <span class="v">V</span>
                `;
                leyendaEcuacion.innerHTML = `
                    Donde <span class="t">(Δt)</span> es el tiempo,
                    <span class="d">(Δx)</span> es el desplazamiento, y
                    <span class="v">(V)</span> es la velocidad
                `;
                break;
        }
    }

    // Función para actualizar qué campos son visibles
    function actualizarCamposVisibles(tipoCalculo) {
        // Mostrar todos los campos primero
        camposGrupo.forEach((campo) => {
            campo.style.display = "flex";
            campo.style.order = ""; // Restablecer el orden predeterminado
        });

        // Ocultar el campo que corresponde al tipo de cálculo
        switch (tipoCalculo) {
            case "velocidad":
                camposGrupo[0].style.display = "none";
                break;
            case "desplazamiento":
                camposGrupo[1].style.display = "none";
                break;
            case "tiempo":
                // Cambiar el orden de los campos visibles para "tiempo"
                camposGrupo[2].style.order = 1; // Tiempo
                camposGrupo[1].style.order = 2; // Desplazamiento
                camposGrupo[0].style.order = 3; // Velocidad
                camposGrupo[2].style.display = "none";
                break;
        }
    }

    // Añadir event listeners a los botones
    resolverBotones.forEach((boton) => {
        boton.addEventListener("click", function () {
            // Quitar la clase 'active' de todos los botones
            resolverBotones.forEach((b) => b.classList.remove("active"));

            // Añadir la clase 'active' al botón seleccionado
            this.classList.add("active");

            // Obtener el tipo de cálculo del atributo data-solve
            const tipoCalculo = this.getAttribute("data-solve");

            // Actualizar la ecuación y los campos visibles
            actualizarEcuacion(tipoCalculo);
            actualizarCamposVisibles(tipoCalculo);
        });
    });

    // Inicializar con el primer botón (velocidad) como activo
    actualizarEcuacion("velocidad");
    actualizarCamposVisibles("velocidad");

    // Implementar la lógica de cálculo (esto puede expandirse según necesidades)
    const calcularBoton = document.getElementById("limpiar");
    const inputs = document.querySelectorAll(".campos-grupo input");
    const resultadoNumero = document.querySelector(".resultado-numero");
    const resultadoUnidad = document.querySelector(".resultado-unidad");
    const resultadoEcuacion = document.getElementById("resultado-ecuacion");

    // Función para contar cifras significativas
    function contarCifrasSignificativas(numero) {
        if (numero === 0) return 0;

        // Convertir a string y manejar formato
        let str = numero.toString();

        // Eliminar el signo si existe
        if (str[0] === "-" || str[0] === "+") {
            str = str.substring(1);
        }

        // Manejar notación científica
        if (str.includes("e")) {
            const partes = str.split("e");
            str = partes[0];
        }

        // Eliminar punto decimal para contar dígitos
        str = str.replace(".", "");

        // Eliminar ceros a la izquierda
        str = str.replace(/^0+/, "");

        // Contar los dígitos restantes
        return str.length;
    }

    // Función para determinar el número de cifras significativas basado en valores de entrada
    function determinarCifrasSignificativas(valor1, valor2) {
        // Obtener cifras significativas de cada valor
        const cifrasValor1 = contarCifrasSignificativas(valor1);
        const cifrasValor2 = contarCifrasSignificativas(valor2);

        // Usar el menor número de cifras significativas
        return Math.min(cifrasValor1, cifrasValor2);
    }

    // Función para formatear el resultado según cifras significativas, con comas decimales
    function formatearResultado(resultado, cifrasSignificativas) {
        if (cifrasSignificativas <= 0)
            return resultado.toString().replace(".", ",");

        // Para números enteros como 60, 700, necesitamos determinar si mostrar decimales
        let decimalesNecesarios = 0;

        if (resultado >= 1) {
            // Para números enteros o mayores que 1
            const potencia = Math.floor(Math.log10(Math.abs(resultado))) + 1;

            // Si el número tiene menos dígitos que las cifras significativas necesarias,
            // necesitamos añadir decimales
            if (potencia < cifrasSignificativas) {
                decimalesNecesarios = cifrasSignificativas - potencia;
            }
        } else {
            // Para números menores que 1
            // Contar ceros después del punto decimal
            const strNum = resultado.toString();
            const match = strNum.match(/0\.0*/);
            const cerosDespuesDelPunto = match ? match[0].length - 2 : 0;

            decimalesNecesarios = cerosDespuesDelPunto + cifrasSignificativas;
        }

        // Formatear el resultado con los decimales necesarios
        const resultadoFormateado = resultado.toFixed(decimalesNecesarios);

        // Reemplazar punto decimal por coma para formato español
        return resultadoFormateado.replace(".", ",");
    }

    // Función para convertir unidades de velocidad
    function convertirVelocidad(valor, unidadOrigen, unidadDestino) {
        if (unidadOrigen === "km/h" && unidadDestino === "m/s") {
            return valor / 3.6;
        } else if (unidadOrigen === "m/s" && unidadDestino === "km/h") {
            return valor * 3.6;
        }
        return valor; // Si las unidades son iguales, no se realiza conversión
    }

    // Modificar la lógica de cálculo para incluir la conversión de unidades y corregir cifras significativas
    function calcular() {
        const tipoCalculo = document
            .querySelector(".resolver-opciones button.active")
            .getAttribute("data-solve");

        let valores = {
            velocidad: 0,
            desplazamiento: 0,
            tiempo: 0,
        };

        if (camposGrupo[0].style.display !== "none") {
            valores.velocidad = parseFloat(inputs[0].value) || 0;
        }

        if (camposGrupo[1].style.display !== "none") {
            valores.desplazamiento = parseFloat(inputs[1].value) || 0;
        }

        if (camposGrupo[2].style.display !== "none") {
            valores.tiempo = parseFloat(inputs[2].value) || 0;
        }

        const unidadVelocidad = document.getElementById("unidades-velocidad").value;
        const unidadDestino = "m/s"; // Unidad base para cálculos internos

        // Convertir velocidad a la unidad base si es necesario
        valores.velocidad = convertirVelocidad(valores.velocidad, unidadVelocidad, unidadDestino);

        let resultado = 0;
        let unidad = "";
        let ecuacion = "";

        switch (tipoCalculo) {
            case "velocidad":
                if (valores.tiempo > 0) {
                    resultado = valores.desplazamiento / valores.tiempo;
                    resultado = convertirVelocidad(resultado, unidadDestino, unidadVelocidad); // Convertir de vuelta a la unidad seleccionada
                    unidad = unidadVelocidad;

                    const cifrasV = determinarCifrasSignificativas(
                        valores.desplazamiento,
                        valores.tiempo
                    );
                    resultado = parseFloat(resultado.toPrecision(cifrasV)); // Ajustar cifras significativas

                    const desplazamientoStr = valores.desplazamiento
                        .toString()
                        .replace(".", ",");
                    const tiempoStr = valores.tiempo.toString().replace(".", ",");
                    ecuacion = `V = ${desplazamientoStr} / ${tiempoStr} = ${formatearResultado(resultado, cifrasV)} ${unidad}`;
                }
                break;
            case "desplazamiento":
                resultado = valores.velocidad * valores.tiempo;
                unidad = "m";

                const cifrasD = determinarCifrasSignificativas(
                    valores.velocidad,
                    valores.tiempo
                );
                resultado = parseFloat(resultado.toPrecision(cifrasD)); // Ajustar cifras significativas

                const velocidadStr = valores.velocidad.toString().replace(".", ",");
                const tiempoStr = valores.tiempo.toString().replace(".", ",");
                ecuacion = `Δx = ${velocidadStr} × ${tiempoStr} = ${formatearResultado(resultado, cifrasD)} ${unidad}`;
                break;
            case "tiempo":
                if (valores.velocidad > 0) {
                    resultado = valores.desplazamiento / valores.velocidad;
                    unidad = "s";

                    const cifrasT = determinarCifrasSignificativas(
                        valores.desplazamiento,
                        valores.velocidad
                    );
                    resultado = parseFloat(resultado.toPrecision(cifrasT)); // Ajustar cifras significativas

                    const desplazamientoStr = valores.desplazamiento
                        .toString()
                        .replace(".", ",");
                    const velocidadStr = valores.velocidad.toString().replace(".", ",");
                    ecuacion = `Δt = ${desplazamientoStr} / ${velocidadStr} = ${formatearResultado(resultado, cifrasT)} ${unidad}`;
                }
                break;
        }

        resultadoNumero.textContent = formatearResultado(
            resultado,
            determinarCifrasSignificativas(valores.desplazamiento, valores.tiempo)
        );
        resultadoUnidad.textContent = unidad;
        resultadoEcuacion.textContent = ecuacion;
    }

    // Añadir event listeners para calcular cuando se cambien los inputs
    inputs.forEach((input) => {
        input.addEventListener("input", calcular);
    });

    // Añadir event listener para el botón de limpiar
    calcularBoton.addEventListener("click", function () {
        // Limpiar los inputs
        inputs.forEach((input) => {
            input.value = "";
        });

        // Limpiar el resultado
        resultadoNumero.textContent = "";
        resultadoUnidad.textContent = "";
        resultadoEcuacion.textContent = "";
    });
});
