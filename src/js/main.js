    let refs = [];
    let btns = [];
    let saldo = 0;
    const listaMovimientos = [];

    // Variables para la encuesta
    let x = 1;
    let count = 0;
    let percent = 0;
    let selectedItems = [];

    window.onload = init;

    function init() {
        // Inicialización de elementos del primer script
        refs["splash"] = document.getElementById("splash");
        refs["home"] = document.getElementById("home");
        refs["resumen"] = document.getElementById("resumen");
        refs["ganancia"] = document.getElementById("ganancia");
        refs["gasto"] = document.getElementById("gasto");
        refs["sobre"] = document.getElementById("sobre");
        refs["encuesta"] = document.getElementById("encuesta");
        refs["navbar"] = document.getElementById("navbar");

        btns["btn_resumen"] = document.getElementById("btn_resumen");
        btns["btn_ganancia"] = document.getElementById("btn_ganancia");
        btns["btn_gasto"] = document.getElementById("btn_gasto");
        btns["btn_sobre"] = document.getElementById("btn_sobre");
        btns["btn_encuesta"] = document.getElementById("btn_encuesta");
        btns["btn_navbar"] = document.getElementById("btn_navbar");

        
        btns["btn_home"] = document.getElementById("btn_home");
        btns["btn2_resumen"] = document.getElementById("btn2_resumen");
        btns["btn2_ganancia"] = document.getElementById("btn2_ganancia");
        btns["btn2_gasto"] = document.getElementById("btn2_gasto");
        btns["btn2_sobre"] = document.getElementById("btn2_sobre");
        btns["btn2_encuesta"] = document.getElementById("btn2_encuesta");
        

        asignarEventosMenu();
        asignarVolver();
        cargarDatos();

        renderizarMovimientos(listaMovimientos);

        setTimeout(() => {
            cargarSeccion("home");
        }, 3000);

        document.getElementById("btn_aceptar_ganancia").addEventListener("click", sumarSaldo);
        document.getElementById("btn_aceptar_gasto").addEventListener("click", restarSaldo);
        document.getElementById("btn_resumen").addEventListener("click", () => renderizarMovimientos(listaMovimientos));

        // Inicialización de elementos del segundo script
        document.querySelectorAll('.mm-prev-btn').forEach(function(btn) {
            btn.style.display = 'none';
        });

        initSurvey();
    }

    function initSurvey() {
        document.querySelectorAll('.mm-survey-container .mm-survey-page').forEach(function(item) {
            const page = item.getAttribute('data-page');
            item.classList.add('mm-page-' + page);
        });

        getCount();
        goToNext();
        goToPrev();
        buildStatus();
        deliverStatus();
        submitData();
        goBack();
    }

    function sumarSaldo() {
        const cantidad = parseFloat(document.getElementById("input-ganancia").value.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(cantidad) && cantidad > 0) {
            saldo += cantidad;
            document.getElementById("saldo-usuario").textContent = formatCurrency(saldo);

            const { fecha, hora } = getCurrentDateTime();
            listaMovimientos.push(new Movimiento(cantidad, 'ganancia', hora, fecha));

            guardarDatos(saldo, listaMovimientos);

            document.getElementById("input-ganancia").value = "";

            cargarSeccion("home");
        } else {
            window.alert("Debes ingresar un número que sea más grande que 0!");
        }
    }

    function restarSaldo() {
        const cantidad = parseFloat(document.getElementById("input-gasto").value.replace(/[^0-9.]/g, ''));

        if (!isNaN(cantidad) && cantidad > 0) {
            const saldoActual = parseFloat(document.getElementById("saldo-usuario").textContent.replace(/[^0-9.]/g, '')) || saldo;

            if (saldoActual >= cantidad) {
                saldo -= cantidad;
                document.getElementById("saldo-usuario").textContent = formatCurrency(saldo);

                const { fecha, hora } = getCurrentDateTime();
                listaMovimientos.push(new Movimiento(cantidad, 'gasto', hora, fecha));

                guardarDatos(saldo, listaMovimientos);

                document.getElementById("input-gasto").value = "";

                cargarSeccion("home");
            } else {
                window.alert("No puedes hacer ese gasto! No tienes saldo suficiente.");
            }
        } else {
            window.alert("Debes ingresar un número que sea más grande que 0!");
        }
    }

    class Movimiento {
        constructor(valor, tipo, hora, fecha) {
            this.valor = valor;
            this.tipo = tipo;
            this.hora = hora;
            this.fecha = fecha;
        }
    }

    function getCurrentDateTime() {
        const now = new Date();
        const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS
        return { fecha, hora };
    }

    function formatCurrency(amount) {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
    }

    function agruparPorFecha(movimientos) {
        return movimientos.reduce((grupos, movimiento) => {
            const fecha = movimiento.fecha;
            if (!grupos[fecha]) {
                grupos[fecha] = [];
            }
            grupos[fecha].push(movimiento);
            return grupos;
        }, {});
    }

    function renderizarMovimientos(movimientos) {
        movimientos.sort((a, b) => {
            if (a.fecha === b.fecha) {
                return new Date(`1970-01-01T${b.hora}`) - new Date(`1970-01-01T${a.hora}`);
            }
            return new Date(b.fecha) - new Date(a.fecha);
        });

        const container = document.getElementById('movimientos-container');
        container.innerHTML = '';

        if (movimientos.length) {
            const gruposPorFecha = agruparPorFecha(movimientos);
            
            for (const fecha in gruposPorFecha) {
                const grupo = gruposPorFecha[fecha];

                const grupoDiv = document.createElement('div');
                grupoDiv.classList.add('movimiento-grupo');

                const fechaTitulo = document.createElement('div');
                fechaTitulo.classList.add('fecha-titulo');
                fechaTitulo.textContent = `Fecha: ${fecha}`;
                grupoDiv.appendChild(fechaTitulo);

                grupo.forEach(movimiento => {
                    const movimientoDiv = document.createElement('div');
                    movimientoDiv.classList.add('movimiento', `tipo-${movimiento.tipo}`);

                    const tipoDiv = document.createElement('div');
                    tipoDiv.classList.add('tipo');
                    tipoDiv.textContent = movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1);

                    const detallesDiv = document.createElement('div');
                    detallesDiv.classList.add('detalles');

                    const valorDiv = document.createElement('div');
                    valorDiv.classList.add('valor');

                    if (movimiento.tipo == 'ganancia') valorDiv.textContent = '+' + formatCurrency(movimiento.valor);
                    else valorDiv.textContent = '-' + formatCurrency(movimiento.valor);

                    const horaDiv = document.createElement('div');
                    horaDiv.classList.add('hora');
                    horaDiv.textContent = movimiento.hora;

                    detallesDiv.appendChild(valorDiv);
                    detallesDiv.appendChild(horaDiv);

                    movimientoDiv.appendChild(tipoDiv);
                    movimientoDiv.appendChild(detallesDiv);
                    grupoDiv.appendChild(movimientoDiv);
                });

                container.appendChild(grupoDiv);
            }
        } else {
            const img = document.createElement('img');
            img.src = 'https://i.imgur.com/a0dqpAM.png';
            img.classList.add("imagen");

            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            emptyDiv.textContent = 'No hay nada aquí hasta que agregues un gasto o una ganancia';
            emptyDiv.classList.add('valor');
            container.appendChild(emptyDiv);
            container.appendChild(img);
        }
    }

    function asignarVolver() {
        document.querySelectorAll(".volver").forEach(btn => {
            btn.addEventListener("click", () => {
                cargarSeccion("home");
                resetSurvey();
            });
        });
    }

    function asignarEventosMenu() {
        
        btns["btn_home"].addEventListener("click", cambiarSeccion);
        btns["btn_resumen"].addEventListener("click", cambiarSeccion);
        btns["btn_ganancia"].addEventListener("click", cambiarSeccion);
        btns["btn_gasto"].addEventListener("click", cambiarSeccion);
        btns["btn_sobre"].addEventListener("click", cambiarSeccion);
        btns["btn_encuesta"].addEventListener("click", cambiarSeccion);
        btns["btn_navbar"].addEventListener("click", cambiarSeccion);
        btns["btn2_resumen"].addEventListener("click", cambiarSeccion);
        btns["btn2_ganancia"].addEventListener("click", cambiarSeccion);
        btns["btn2_gasto"].addEventListener("click", cambiarSeccion);
        btns["btn2_sobre"].addEventListener("click", cambiarSeccion);
        btns["btn2_encuesta"].addEventListener("click", cambiarSeccion);
    }

    function ocultar() {
        for (let key in refs) {
            refs[key].classList.add("ocultar");
        }
    }

    function cambiarSeccion(e) {
        const targetId = e.currentTarget.id;  
        const seccion = targetId.split("_")[1]; 
        cargarSeccion(seccion);
    }

    function cargarSeccion(seccion) {
        ocultar();
        refs[seccion].classList.remove("ocultar");
        refs[seccion].classList.add("animate__animated", "animate__fadeIn");
    }

    function guardarDatos(nuevoSaldo, listaMovimientos) {
        localStorage.setItem("saldo-usuario", nuevoSaldo);
        localStorage.setItem("movimientos", JSON.stringify(listaMovimientos));
    }

    function cargarDatos() {
        const saldoGuardado = localStorage.getItem("saldo-usuario");
        const movimientosGuardados = localStorage.getItem("movimientos");

        if (saldoGuardado) {
            saldo = parseFloat(saldoGuardado);
            document.getElementById("saldo-usuario").textContent = formatCurrency(saldo);
        }

        if (movimientosGuardados) {
            listaMovimientos.push(...JSON.parse(movimientosGuardados));
        }
    }

    function getCount() {
        count = document.querySelectorAll('.mm-survey-page').length;
    }

    function goToNext() {
        document.querySelectorAll('.mm-next-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (x < count) {
                    x = goToSlide(x);
                    updateSurvey();
                } else {
                    showResults();
                }
            });
        });
    }

    function goToPrev() {
        document.querySelectorAll('.mm-prev-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                x = goBackSlide(x);
                updateSurvey();
            });
        });
    }

    function updateSurvey() {
        document.querySelectorAll('.mm-survey-page').forEach(function(page) {
            page.classList.remove('active');
        });
        document.querySelector('.mm-page-' + x).classList.add('active');
        checkStatus();
        getButtons();
        buildProgress(x / count);
    }

    function goToSlide(current) {
        return current + 1;
    }

    function goBackSlide(current) {
        return current - 1;
    }

    function getButtons() {
        const prevBtn = document.querySelector('.mm-prev-btn');
        const nextBtn = document.querySelector('.mm-next-btn button');
    
        if (x === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }
    
        if (x === count) {
            nextBtn.innerText = 'Ver Resultados';
        } else {
            nextBtn.innerText = 'Siguiente';
        }
    }
    function showResults() {
        collectData();
        document.querySelector('.mm-survey-bottom').style.display = 'none';
        document.querySelector('.mm-survey-progress').style.display = 'none';
        document.querySelector('.mm-survey-results').style.display = 'block';
    }
    

    function buildProgress(progress) {
        percent = progress * 100;
        deliverProgress(percent);
    }

    function deliverProgress(percent) {
        document.querySelector('.mm-progress').style.width = percent + '%';
    }

    function checkStatus() {
        document.querySelector('.mm-next-btn button').disabled = !document.querySelector('.mm-survey-page.active input[type="radio"]:checked');
    }

    function buildStatus() {
        document.querySelectorAll('.mm-survey-item input').forEach(function(item) {
            item.addEventListener('click', function() {
                if (!selectedItems.includes(item.getAttribute('data-item'))) {
                    selectedItems.push(item.getAttribute('data-item'));
                }
                document.querySelector('.mm-next-btn button').disabled = false;
            });
        });
    }

    function deliverStatus() {
        // Procesar el estado aquí si es necesario
    }

    function submitData() {
        document.querySelector('.mm-finish-btn button').addEventListener('click', function() {
            collectData();
            document.querySelector('.mm-survey-bottom').style.display = 'none';
            document.querySelector('.mm-survey-progress').style.display = 'none';
            document.querySelector('.mm-survey-results').style.display = 'block';
        });
    }

    function goBack() {
        document.addEventListener('DOMContentLoaded', function() {

        document.querySelector('.mm-back-btn button').addEventListener('click', function() {
                document.querySelector('.mm-survey-bottom').style.display = 'block';
                document.querySelector('.mm-survey-results').style.display = 'none';
                cargarSeccion("home");
                resetSurvey();
            });
        });
    }
    

    function resetSurvey() {
        deliverProgress(0);
        document.querySelectorAll('.mm-survey-page').forEach(function(page) {
            page.classList.remove('active');
        });
        document.querySelector('.mm-page-1').classList.add('active');
        getButtons();
        document.querySelector('.mm-finish-btn').style.display = 'none';
        document.querySelector('.mm-survey-results-score').innerText = '';
        document.querySelector('.mm-survey-results-container').innerHTML = '';
        selectedItems = [];
        x = 1;
        document.querySelectorAll('.mm-survey-item input:checked').forEach(function(input) {
            input.checked = false;
        });
    }

    function collectData() {
        const map = {};
        const correctAnswers = ['Si', 'Si', 'No', 'Tengo un lugar en mente', 'No', 'No', 'Calmado y neutral'];
        let totalCorrect = 0;

        document.querySelectorAll('.mm-survey-item input:checked').forEach(function(item) {
            map[item.getAttribute('data-item')] = item.value;
        });

        for (let i = 0; i < correctAnswers.length; i++) {
            if (map[i + 1] === correctAnswers[i]) {
                totalCorrect++;
            }
        }

        const result = ((totalCorrect / correctAnswers.length) * 100).toFixed(0);
        document.querySelector('.mm-survey-results-score').innerText = result > 50 ? '¡Puedes comprarlo!' : 'Deberías pensarlo un poco mejor';
    }
