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