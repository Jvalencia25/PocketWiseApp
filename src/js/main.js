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

    setTimeout(()=>{
        cargarSeccion("home");
    }, 3000);

    document.getElementById("btn_aceptar_ganancia").addEventListener("click", function() {
        const inputGanancia = document.getElementById("input-ganancia").value;
        const cantidad = parseFloat(inputGanancia.replace(/[^0-9.]/g, ''));
        if (!isNaN(cantidad) && cantidad>0) {
            const saldoElement = document.getElementById("saldo-usuario");
            const saldoActual = parseFloat(saldoElement.textContent.replace(/[^0-9.]/g, '')) || 0;
            const nuevoSaldo = saldoActual + cantidad;
            saldoElement.textContent = formatCurrency(nuevoSaldo);
            // Obtener fecha y hora actuales
            const { fecha, hora } = getCurrentDateTime();
            
            // Crear una instancia de Movimiento
            const movimiento = new Movimiento(cantidad, 'ganancia', hora, fecha);
            
            listaMovimientos.push(movimiento);
        }
        cargarSeccion("home");
    });
}
class Movimiento {
    constructor(valor, tipo, hora, fecha) {
        this.valor = valor;
        this.tipo = tipo;
        this.hora = hora;
        this.fecha = fecha;
    }
}

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
    let seccion = e.target.id.split("_")[1];
    cargarSeccion(seccion);
}

function cargarSeccion(seccion){
    ocultar();
    refs[seccion].classList.remove("ocultar");
    refs[seccion].classList.add("animate__animated", "animate__fadeIn");
}