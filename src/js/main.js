let refs = [];
let btns = [];
let saldo = 0;
const listaMovimientos = [];

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

    btns["btn_resumen"] = document.getElementById("btn_resumen");
    btns["btn_ganancia"] = document.getElementById("btn_ganancia");
    btns["btn_gasto"] = document.getElementById("btn_gasto");
    btns["btn_sobre"] = document.getElementById("btn_sobre");
    btns["btn_encuesta"] = document.getElementById("btn_encuesta");

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
    // Código del segundo script
    document.querySelectorAll('.mm-survey-container .mm-survey-page').forEach(function(item) {
        var page = item.getAttribute('data-page');
        item.classList.add('mm-page-' + page);
    });

    getCurrentSlide();
    goToNext();
    goToPrev();
    getCount();
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
        img.src = '../img/placeholder_empty.jpg';
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
    let btns_volver = document.querySelectorAll(".volver");
    for (let i = 0; i < btns_volver.length; i++) {
        btns_volver[i].addEventListener("click", () => {
            cargarSeccion("home");
            resetSurvey();
        });
    }
}

function asignarEventosMenu() {
    btns["btn_resumen"].addEventListener("click", cambiarSeccion);
    btns["btn_ganancia"].addEventListener("click", cambiarSeccion);
    btns["btn_gasto"].addEventListener("click", cambiarSeccion);
    btns["btn_sobre"].addEventListener("click", cambiarSeccion);
    btns["btn_encuesta"].addEventListener("click", cambiarSeccion);
}

function ocultar() {
    for (let key in refs) {
        refs[key].classList.add("ocultar");
    }
}

function cambiarSeccion(e) {
    let targetId = e.currentTarget.id;  
    let seccion = targetId.split("_")[1]; 
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
        const movimientos = JSON.parse(movimientosGuardados);
        movimientos.forEach(movimiento => {
            listaMovimientos.push(new Movimiento(movimiento.valor, movimiento.tipo, movimiento.hora, movimiento.fecha));
        });
    }
}

// Funciones del segundo script
var x;
var count;
var percent;
var z = [];

function getCount() {
    count = document.querySelectorAll('.mm-survey-page').length;
    return count;
}

function goToNext() {
    document.querySelectorAll('.mm-next-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            goToSlide(x);
            getCount();
            current = x + 1;
            var g = current / count;
            buildProgress(g);
            getButtons();
            document.querySelectorAll('.mm-survey-page').forEach(function(page) {
                page.classList.remove('active');
            });
            document.querySelector('.mm-page-' + current).classList.add('active');
            getCurrentSlide();
            checkStatus();
            if (document.querySelector('.mm-page-' + count).classList.contains('active')) {
                if (document.querySelector('.mm-page-' + count).classList.contains('pass')) {
                    document.querySelector('.mm-finish-btn').classList.add('active');
                } else {
                    document.querySelectorAll('.mm-page-' + count + ' .mm-survery-content .mm-survey-item').forEach(function(item) {
                        item.addEventListener('click', function() {
                            document.querySelector('.mm-finish-btn').classList.add('active');
                        });
                    });
                }
            }
        });
    });
}

function getCurrentSlide() {
    document.querySelectorAll('.mm-survey-page').forEach(function(item) {
        if (item.classList.contains('active')) {
            x = parseInt(item.getAttribute('data-page'));
        }
    });
    return x;
}

function goToSlide(x) {
    x = x + 1;
    return x;
}

function goToPrev() {
    document.querySelectorAll('.mm-prev-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            goBackSlide(x);
            getCount();
            current = x - 1;
            var g = current / count;
            buildProgress(g);
            getButtons();
            document.querySelectorAll('.mm-survey-page').forEach(function(page) {
                page.classList.remove('active');
            });
            document.querySelector('.mm-page-' + current).classList.add('active');
            getCurrentSlide();
            checkStatus();
        });
    });
}

function goBackSlide(x) {
    x = x - 1;
    return x;
}

function getButtons() {
    if (x === 1) {
        document.querySelectorAll('.mm-prev-btn').forEach(function(btn) {
            btn.style.display = 'none';
        });
    } else {
        document.querySelectorAll('.mm-prev-btn').forEach(function(btn) {
            btn.style.display = 'block';
        });
    }
    if (x === count) {
        document.querySelector('.mm-next-btn').style.display = 'none';
    } else {
        document.querySelector('.mm-next-btn').style.display = 'block';
    }
}

function buildProgress(g) {
    percent = g * 100;
    deliverProgress(percent);
}

function deliverProgress(percent) {
    document.querySelector('.mm-progress').style.width = percent + '%';
}

function checkStatus() {
    // Deshabilitar el botón de siguiente por defecto
    document.querySelector('.mm-next-btn button').disabled = true;

    // Escuchar cambios en los inputs de radio de la página actual
    document.querySelectorAll('.mm-survey-page.active .mm-survey-item input').forEach(function(input) {
        input.addEventListener('change', function() {
            // Habilitar el botón de siguiente cuando se selecciona una opción
            if (document.querySelector('.mm-survey-page.active input[type="radio"]:checked')) {
                document.querySelector('.mm-next-btn button').disabled = false;
            }
        });
    });
}

function buildStatus() {
    document.querySelectorAll('.mm-survey-item input').forEach(function(item) {
        item.addEventListener('click', function() {
            var data = item.getAttribute('data-item');
            var value = item.value;
            z.push(data);
            if (z.length > 0) {
                document.querySelector('.mm-next-btn button').disabled = false;
            }
        });
    });
}

function deliverStatus() {
    var m = z.length;
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
    document.querySelectorAll('.mm-back-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelector('.mm-survey-bottom').style.display = 'block';
            document.querySelector('.mm-survey-results').style.display = 'none';
            cargarSeccion("home");
            resetSurvey();
        });
    });
}
function resetSurvey() {
    // Reiniciar el progreso
    deliverProgress(0);

    // Reiniciar el estado de las páginas
    document.querySelectorAll('.mm-survey-page').forEach(function(page) {
        page.classList.remove('active');
    });
    document.querySelector('.mm-page-1').classList.add('active');

    // Reiniciar los botones
    document.querySelector('.mm-prev-btn').style.display = 'none';
    document.querySelector('.mm-next-btn').style.display = 'block';
    document.querySelector('.mm-next-btn button').disabled = true;
    document.querySelector('.mm-finish-btn').style.display = 'none'; // Asegura que el botón de finalizar esté oculto al reiniciar

    // Limpiar los resultados
    document.querySelector('.mm-survey-results-score').innerText = '';
    document.querySelector('.mm-survey-results-container').innerHTML = '';

    // Desmarcar todas las respuestas seleccionadas
    document.querySelectorAll('.mm-survey-item input:checked').forEach(function(input) {
        input.checked = false;
    });

    // Reiniciar la variable de seguimiento
    x = 1;
    z = [];

    // Volver a habilitar los botones de siguiente y anterior según corresponda
    getButtons();
}

function collectData() {
    var map = {};
    var ax = ['Red', 'Mercedes', '3.14', '3']; // Actualiza las respuestas correctas según tus preguntas
    var ttl = 0;

    document.querySelectorAll('.mm-survey-item input:checked').forEach(function(item) {
        var data = item.value;
        var name = item.getAttribute('data-item');
        map[name] = data;
    });

    // Calcula el total de respuestas correctas
    for (var i = 1; i <= count; i++) {
        if (map[i] === ax[i - 1]) {
            ttl++;
        }
    }
    
    // Calcula el porcentaje de aciertos
    var results = ((ttl / count) * 100).toFixed(0);
    
    // Mostrar el resultado y la imagen correspondiente
    if (results > 50) {
        document.querySelector('.mm-survey-results-score').innerText = '¡Puedes comprarlo!';
        document.querySelector('.mm-survey-results-container').innerHTML += '<img src="ruta_de_la_imagen_positiva.png" alt="Resultado Positivo">';
    } else {
        document.querySelector('.mm-survey-results-score').innerText = 'Deberías pensarlo un poco mejor';
        document.querySelector('.mm-survey-results-container').innerHTML += '<img src="ruta_de_la_imagen_negativa.png" alt="Resultado Negativo">';
    }
}