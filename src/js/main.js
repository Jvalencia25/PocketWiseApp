let refs = [];
let btns = [];

window.onload = init;

function init(){
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

    setTimeout(()=>{
        cargarSeccion("home");
    }, 3000);

    document.getElementById("btn_aceptar_ganancia").addEventListener("click", sumarSaldo);
    document.getElementById("btn_aceptar_gasto").addEventListener("click", restarSaldo);
    document.getElementById("btn_resumen").addEventListener("click", () => renderizarMovimientos(listaMovimientos));
}

function sumarSaldo(){
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

function restarSaldo(){
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

let saldo=0;
const listaMovimientos = [];

function getCurrentDateTime() {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS
    return { fecha, hora };
}


function formatCurrency(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

function agruparPorFecha(movimientos){
    return movimientos.reduce((grupos, movimiento) => {
        const fecha = movimiento.fecha;
        if (!grupos[fecha]){
            grupos[fecha] = [];
        }
        grupos[fecha].push(movimiento)
        return grupos;
    }, {});
}

function renderizarMovimientos(movimientos){
    
    const container = document.getElementById('movimientos-container');
    container.innerHTML = '';

    if(movimientos.length){
        const gruposPorFecha = agruparPorFecha(movimientos);
        
        for (const fecha in gruposPorFecha){
            const grupo = gruposPorFecha[fecha];

            const grupoDiv = document.createElement('div');
            grupoDiv.classList.add('movimiento-grupo');

            const fechaTitulo = document.createElement('div');
            fechaTitulo.classList.add('fecha-titulo');
            fechaTitulo.textContent = `Fecha: ${fecha}`;
            grupoDiv.appendChild(fechaTitulo);

            grupo.forEach(movimiento =>{
                const movimientoDiv = document.createElement('div');
                movimientoDiv.classList.add('movimiento', `tipo-${movimiento.tipo}`);

                const tipoDiv = document.createElement('div');
                tipoDiv.classList.add('tipo');
                tipoDiv.textContent = movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1);

                const detallesDiv = document.createElement('div');
                detallesDiv.classList.add('detalles');

                const valorDiv = document.createElement('div');
                valorDiv.classList.add('valor');

                if (movimiento.tipo=='ganancia') valorDiv.textContent = '+'+formatCurrency(movimiento.valor);
                else valorDiv.textContent = '-'+formatCurrency(movimiento.valor);

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
    }
    else{

        const img = document.createElement('img');
        img.src = '../img/placeholder_empty.jpg';
        img.classList.add("imagen");

        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        emptyDiv.textContent = 'No hay nada aqui hasta que agregues un gasto o una ganancia';
        emptyDiv.classList.add('valor');
        container.appendChild(emptyDiv);
        container.appendChild(img);
    }
}

function asignarVolver(){
    let btns_volver = document.querySelectorAll(".volver");
    for (let i = 0; i < btns_volver.length; i++) {
        btns_volver[i].addEventListener("click", ()=>{
            cargarSeccion("home");
        });
    }
}
function asignarEventosMenu()
{
    btns["btn_resumen"].addEventListener("click", cambiarSeccion);
    btns["btn_ganancia"].addEventListener("click", cambiarSeccion);
    btns["btn_gasto"].addEventListener("click", cambiarSeccion);
    btns["btn_sobre"].addEventListener("click", cambiarSeccion);
    btns["btn_encuesta"].addEventListener("click", cambiarSeccion);
}
function ocultar()
{
    for (let key in refs) {
        refs[key].classList.add("ocultar");
    }
}
function cambiarSeccion(e){ 
    let targetId = e.currentTarget.id;  
    let seccion = targetId.split("_")[1]; 
    cargarSeccion(seccion);
}

function cargarSeccion(seccion){
    ocultar();
    refs[seccion].classList.remove("ocultar");
    refs[seccion].classList.add("animate__animated", "animate__fadeIn");
}

function guardarDatos(nuevoSaldo, listaMovimientos){
    localStorage.setItem("saldo-usuario", nuevoSaldo);
    localStorage.setItem("movimientos", JSON.stringify(listaMovimientos));
}

function cargarDatos(){
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