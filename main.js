document.addEventListener("DOMContentLoaded", function () {
    // ========== CÓDIGO PARA CALCULADORA DE VELOCIDAD, DESPLAZAMIENTO Y TIEMPO ==========

    // Seleccionar elementos del DOM para la primera calculadora
    const resolverBotones = document.querySelectorAll(
        ".calculadora .resolver-opciones button"
    );
    const ecuacionSpan = document.querySelector(".calculadora .ecuacion");
    const leyendaEcuacion = document.querySelector(".calculadora .leyenda-ecuacion");
    const camposGrupo = document.querySelectorAll(".calculadora .campos-grupo");

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
    const primerBoton = resolverBotones[0];
    if (primerBoton) {
        primerBoton.classList.add("active");
        actualizarEcuacion("velocidad");
        actualizarCamposVisibles("velocidad");
    }

    // Implementar la lógica de cálculo
    const calcularBoton = document.getElementById("limpiar");
    const inputs = document.querySelectorAll(".calculadora .campos-grupo input");
    const resultadoNumero = document.querySelector(".calculadora .resultado-numero");
    const resultadoUnidad = document.querySelector(".calculadora .resultado-unidad");

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

    // Ajustar el formateo del resultado para respetar estrictamente las cifras significativas
    function formatearResultado(resultado, cifrasSignificativas) {
        if (cifrasSignificativas <= 0) {
            return resultado.toString().replace(".", ",");
        }

        // Redondear el número a las cifras significativas
        const factor = Math.pow(10, cifrasSignificativas - Math.ceil(Math.log10(Math.abs(resultado))));
        const resultadoRedondeado = Math.round(resultado * factor) / factor;

        // Convertir a string y reemplazar el punto decimal por una coma
        return resultadoRedondeado.toLocaleString("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: cifrasSignificativas - 1
        }).replace(".", ",");
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
            .querySelector(".calculadora .resolver-opciones button.active")
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
    }

    // Añadir event listeners para calcular cuando se cambien los inputs
    inputs.forEach((input) => {
        input.addEventListener("input", calcular);
    });

    // Añadir event listener para el botón de limpiar
    if (calcularBoton) {
        calcularBoton.addEventListener("click", function () {
            // Limpiar los inputs
            inputs.forEach((input) => {
                input.value = "";
            });

            // Limpiar el resultado
            resultadoNumero.textContent = "";
            resultadoUnidad.textContent = "";
        });
    }

    // ========== CÓDIGO PARA PROBLEMAS DE ENCUENTRO ==========

    // Seleccionar elementos del DOM para problemas de encuentro
    const encuentroBotones = document.querySelectorAll(".calculadora-encuentro .resolver-opciones button");
    const entradaDistanciaSeparacion = document.getElementById("distancia-separacion");
    const unidadesDistancia = document.getElementById("unidades-distancia");
    const posInicial1 = document.getElementById("pos-inicial-1");
    const posInicial2 = document.getElementById("pos-inicial-2");
    const velocidad1 = document.getElementById("velocidad-1");
    const velocidad2 = document.getElementById("velocidad-2");
    const unidadesPos1 = document.getElementById("unidades-pos-1");
    const unidadesPos2 = document.getElementById("unidades-pos-2");
    const unidadesVel1 = document.getElementById("unidades-vel-1");
    const unidadesVel2 = document.getElementById("unidades-vel-2");
    const tiempoEncuentro = document.getElementById("tiempo-encuentro");
    const posicionEncuentro = document.getElementById("posicion-encuentro");
    const resultadoEncuentroNumero = document.querySelector("#resultado-encuentro .resultado-numero");
    const resultadoEncuentroUnidad = document.querySelector("#resultado-encuentro .resultado-unidad");
    const limpiarEncuentroBtn = document.getElementById("limpiar-encuentro");

    // Variables para seguir el tipo de cálculo actual
    let tipoCalculoEncuentro = "tiempo-encuentro"; // Por defecto

    // Función para convertir unidades de velocidad (para problemas de encuentro)
    function convertirVelocidadEncuentro(valor, unidadOrigen, unidadDestino) {
        if (unidadOrigen === "Km/h" && unidadDestino === "m/s") {
            return valor * (1000 / 3600); // km/h a m/s
        } else if (unidadOrigen === "m/s" && unidadDestino === "Km/h") {
            return valor * (3600 / 1000); // m/s a km/h
        }
        return valor; // Misma unidad, no hay conversión
    }

    // Función para convertir unidades de distancia
    function convertirDistancia(valor, unidadOrigen, unidadDestino) {
        if (unidadOrigen === "Km" && unidadDestino === "m") {
            return valor * 1000; // km a m
        } else if (unidadOrigen === "m" && unidadDestino === "Km") {
            return valor / 1000; // m a km
        }
        return valor; // Misma unidad, no hay conversión
    }

    // Función para convertir unidades de tiempo
    function convertirTiempo(valor, unidadOrigen, unidadDestino) {
        if (unidadOrigen === "s" && unidadDestino === "min") {
            return valor / 60; // segundos a minutos
        } else if (unidadOrigen === "s" && unidadDestino === "h") {
            return valor / 3600; // segundos a horas
        } else if (unidadOrigen === "min" && unidadDestino === "s") {
            return valor * 60; // minutos a segundos
        } else if (unidadOrigen === "min" && unidadDestino === "h") {
            return valor / 60; // minutos a horas
        } else if (unidadOrigen === "h" && unidadDestino === "s") {
            return valor * 3600; // horas a segundos
        } else if (unidadOrigen === "h" && unidadDestino === "min") {
            return valor * 60; // horas a minutos
        }
        return valor; // Misma unidad, no hay conversión
    }

    // Modificar la lógica de cálculo para problemas de encuentro
    function calcularEncuentro() {
        // Obtener valores de entrada
        const distanciaSeparacion = parseFloat(entradaDistanciaSeparacion.value) || 0;
        const posIni1 = parseFloat(posInicial1.value) || 0;
        const posIni2 = parseFloat(posInicial2.value) || 0;
        const vel1 = parseFloat(velocidad1.value) || 0;
        const vel2 = parseFloat(velocidad2.value) || 0;

        // Calcular la distancia real entre los objetos
        let distanciaReal = Math.abs(posIni2 - posIni1);

        // Si se proporcionó distancia de separación, usarla en lugar de la calculada
        if (distanciaSeparacion > 0) {
            distanciaReal = distanciaSeparacion;
        }

        // Determinar si los cuerpos se mueven en sentidos opuestos
        const sentidosOpuestos = vel1 * vel2 < 0; // Velocidades con signos opuestos

        // Calcular la velocidad relativa
        const velocidadRelativa = sentidosOpuestos
            ? Math.abs(vel1) + Math.abs(vel2) // Velocidades se suman si son opuestas
            : Math.abs(vel1 - vel2); // Velocidades se restan si son en el mismo sentido

        // Verificar si es posible el encuentro
        let esEncuentroPosible = true;
        if (!sentidosOpuestos && ((vel1 > 0 && vel2 > 0 && vel1 <= vel2) ||
            (vel1 < 0 && vel2 < 0 && vel1 >= vel2))) {
            esEncuentroPosible = false;
        }

        // Calcular tiempo y posición de encuentro
        let tiempoDeEncuentro = 0;
        let posicionDeEncuentro = 0;

        // Calcular posición de encuentro considerando ambas posiciones iniciales y velocidades
        if (esEncuentroPosible && velocidadRelativa !== 0) {
            tiempoDeEncuentro = distanciaReal / velocidadRelativa;

            // Calcular posición de encuentro para el cuerpo 1
            posicionDeEncuentro = posIni1 + vel1 * tiempoDeEncuentro;

            // Verificar si el cálculo considera correctamente las posiciones iniciales
            console.log("Tiempo de Encuentro:", tiempoDeEncuentro);
            console.log("Posición Inicial Cuerpo 1:", posIni1);
            console.log("Velocidad Cuerpo 1:", vel1);
            console.log("Posición de Encuentro Calculada:", posicionDeEncuentro);
        }

        // Agregar mensajes de depuración para verificar cálculos
        console.log("Distancia Real:", distanciaReal);
        console.log("Velocidad Relativa:", velocidadRelativa);
        console.log("Tiempo de Encuentro:", tiempoDeEncuentro);
        console.log("Posición de Encuentro:", posicionDeEncuentro);

        // Mostrar el resultado adicional para el Punto de Encuentro con las unidades seleccionadas

    }

    // Añadir event listeners para los botones de tipo de cálculo
    if (encuentroBotones.length > 0) {
        encuentroBotones.forEach(boton => {
            boton.addEventListener("click", function () {
                // Quitar clase active de todos los botones
                encuentroBotones.forEach(b => b.classList.remove("active"));
                // Agregar clase active al botón seleccionado
                this.classList.add("active");
                // Guardar el tipo de cálculo
                tipoCalculoEncuentro = this.getAttribute("data-solve");
                // Recalcular con el nuevo tipo
                calcularEncuentro();
            });
        });

        // Establecer el primer botón como activo por defecto
        encuentroBotones[0].classList.add("active");
    }

    // Añadir event listeners para los campos de entrada de encuentro
    const camposEncuentro = [entradaDistanciaSeparacion, posInicial1, posInicial2, velocidad1, velocidad2];
    camposEncuentro.forEach(input => {
        if (input) {
            input.addEventListener("input", calcularEncuentro);
        }
    });

    // Añadir event listeners para los selectores de unidades de encuentro
    const selectoresEncuentro = [unidadesDistancia, unidadesPos1, unidadesPos2, unidadesVel1, unidadesVel2];
    selectoresEncuentro.forEach(select => {
        if (select) {
            select.addEventListener("change", calcularEncuentro);
        }
    });

    // Añadir event listener para el botón de limpiar encuentro
    if (limpiarEncuentroBtn) {
        limpiarEncuentroBtn.addEventListener("click", function () {
            // Limpiar todos los campos de entrada
            if (entradaDistanciaSeparacion) entradaDistanciaSeparacion.value = "";
            if (posInicial1) posInicial1.value = "";
            if (posInicial2) posInicial2.value = "";
            if (velocidad1) velocidad1.value = "";
            if (velocidad2) velocidad2.value = "";

            // Limpiar resultados
            if (resultadoEncuentroNumero) resultadoEncuentroNumero.textContent = "";
            if (resultadoEncuentroUnidad) resultadoEncuentroUnidad.textContent = "";
            if (tiempoEncuentro) tiempoEncuentro.textContent = "";
            if (posicionEncuentro) posicionEncuentro.textContent = "";
        });
    }

    // Añadir event listeners para los botones de "Tiempo de Encuentro" y "Punto de Encuentro"
    const botonesEncuentro = document.querySelectorAll(".resolver-encuentro .resolver-opciones button");

    botonesEncuentro.forEach((boton) => {
        boton.addEventListener("click", function () {
            // Quitar la clase 'active' de todos los botones
            botonesEncuentro.forEach((b) => b.classList.remove("active"));

            // Añadir la clase 'active' al botón seleccionado
            this.classList.add("active");

            // Actualizar el tipo de cálculo según el botón seleccionado
            const tipoCalculo = this.getAttribute("data-solve");
            if (tipoCalculo === "tiempo-encuentro") {
                // Lógica para mostrar campos o resultados relacionados con "Tiempo de Encuentro"
                console.log("Seleccionado: Tiempo de Encuentro");
            } else if (tipoCalculo === "punto-encuentro") {
                // Lógica para mostrar campos o resultados relacionados con "Punto de Encuentro"
                console.log("Seleccionado: Punto de Encuentro");
            }
        });
    });
});