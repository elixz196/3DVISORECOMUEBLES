const btnAbrirTodo = document.querySelector("#btn-abrir-todo");
const textoAbrirTodo = btnAbrirTodo.querySelector("span");

let muebleAbierto = false;
let animacionEnCurso = false;

const btnCajon1 = document.querySelector("#btn-cajon1");

let cajonAbierto = false;

const visor = document.querySelector("#visor");

const btnInicio = document.querySelector("#btn-inicio");
const btnRotacion = document.querySelector("#btn-rotacion");
const btnAcercar = document.querySelector("#btn-acercar");
const btnAlejar = document.querySelector("#btn-alejar");
const btnPantalla = document.querySelector("#btn-pantalla");

const vistaInicial = {
    orbit: "35deg 75deg 135%",
    target: "auto auto auto",
    fieldOfView: "30deg"
};

let rotacionActiva = false;

/*
 * Devuelve la distancia actual de la cámara.
 * cameraOrbit.theta y cameraOrbit.phi están en radianes;
 * cameraOrbit.radius contiene la distancia.
 */
function obtenerDistanciaActual() {
    const orbita = visor.getCameraOrbit();
    return orbita.radius;
}

function cambiarDistancia(factor) {
    const orbita = visor.getCameraOrbit();
    const nuevaDistancia = orbita.radius * factor;

    visor.cameraOrbit = `
        ${orbita.theta}rad
        ${orbita.phi}rad
        ${nuevaDistancia}m
    `;
}

/* Vista inicial */

btnInicio.addEventListener("click", () => {
    visor.cameraOrbit = vistaInicial.orbit;
    visor.cameraTarget = vistaInicial.target;
    visor.fieldOfView = vistaInicial.fieldOfView;

    rotacionActiva = false;
    visor.removeAttribute("auto-rotate");
    btnRotacion.classList.remove("activo");

    visor.jumpCameraToGoal();
});

/* Rotación automática */

btnRotacion.addEventListener("click", () => {
    rotacionActiva = !rotacionActiva;

    if (rotacionActiva) {
        visor.setAttribute("auto-rotate", "");
        visor.setAttribute("rotation-per-second", "20deg");
        btnRotacion.classList.add("activo");
    } else {
        visor.removeAttribute("auto-rotate");
        btnRotacion.classList.remove("activo");
    }
});

/* Zoom */

btnAcercar.addEventListener("click", () => {
    cambiarDistancia(0.85);
});

btnAlejar.addEventListener("click", () => {
    cambiarDistancia(1.18);
});

/* Pantalla completa */

btnPantalla.addEventListener("click", async () => {
    try {
        if (!document.fullscreenElement) {
            await document
                .querySelector(".visor-contenedor")
                .requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error("No se pudo cambiar la pantalla completa:", error);
    }
});

/* Cambiar icono visual cuando se sale con Escape */

document.addEventListener("fullscreenchange", () => {
    btnPantalla.classList.toggle(
        "activo",
        Boolean(document.fullscreenElement)
    );
});

/* Confirmar que el modelo cargó y leer animaciones */

visor.addEventListener("load", () => {
    console.log("Modelo 3D cargado correctamente.");
    console.log(
        "Animaciones disponibles:",
        visor.availableAnimations
    );

    btnAbrirTodo.disabled =
        !visor.availableAnimations.includes("Abrir_Todo");
});

btnCajon1.addEventListener("click", () => {

    visor.animationName = "Abrir_Cajon_1";

    if (!cajonAbierto) {

        visor.currentTime = 0;

        visor.play({ repetitions: 1 });

    } else {

        visor.currentTime = visor.duration;

        visor.play({ reverse: true });

    }

    cajonAbierto = !cajonAbierto;

});


btnAbrirTodo.addEventListener("click", () => {
    const nombreAnimacion = "Abrir_Todo";

    if (animacionEnCurso) {
        return;
    }

    if (!visor.availableAnimations.includes(nombreAnimacion)) {
        console.error(
            `No existe la animación ${nombreAnimacion}`,
            visor.availableAnimations
        );
        return;
    }

    animacionEnCurso = true;
    btnAbrirTodo.disabled = true;

    visor.pause();
    visor.animationName = nombreAnimacion;

    if (!muebleAbierto) {
        // Abrir
        visor.timeScale = 1;
        visor.currentTime = 0;
    } else {
        // Cerrar reproduciendo la animación al revés
        visor.timeScale = -1;
        visor.currentTime = visor.duration;
    }

    visor.play({
        repetitions: 1
    });
});

visor.addEventListener("finished", () => {
    muebleAbierto = !muebleAbierto;
    animacionEnCurso = false;

    btnAbrirTodo.disabled = false;
    btnAbrirTodo.classList.toggle("activo", muebleAbierto);

    textoAbrirTodo.textContent = muebleAbierto
        ? "Cerrar"
        : "Abrir";

    btnAbrirTodo.title = muebleAbierto
        ? "Cerrar cajones"
        : "Abrir cajones";
});
