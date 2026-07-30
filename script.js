const visor = document.querySelector("#visor");

const btnInicio = document.querySelector("#btn-inicio");
const btnRotacion = document.querySelector("#btn-rotacion");
const btnAcercar = document.querySelector("#btn-acercar");
const btnAlejar = document.querySelector("#btn-alejar");
const btnPantalla = document.querySelector("#btn-pantalla");
const btnAbrirTodo = document.querySelector("#btn-abrir-todo");

const textoAbrirTodo = btnAbrirTodo.querySelector("span");

const nombreAnimacion = "Abrir_Todo";

const vistaInicial = {
    orbit: "35deg 75deg 135%",
    target: "auto auto auto",
    fieldOfView: "30deg"
};

let rotacionActiva = false;
let muebleAbierto = false;
let animacionEnCurso = false;

/* Cambiar distancia de la cámara */

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
        const contenedor = document.querySelector(
            ".visor-contenedor"
        );

        if (!document.fullscreenElement) {
            await contenedor.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error(
            "No se pudo cambiar la pantalla completa:",
            error
        );
    }
});

document.addEventListener("fullscreenchange", () => {
    btnPantalla.classList.toggle(
        "activo",
        Boolean(document.fullscreenElement)
    );
});

/* Abrir o cerrar todos los mecanismos */

btnAbrirTodo.addEventListener("click", () => {
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
        /* Abrir */
        visor.timeScale = 1;
        visor.currentTime = 0;
    } else {
        /* Cerrar */
        visor.timeScale = -1;
        visor.currentTime = visor.duration;
    }

    visor.play({
        repetitions: 1
    });
});

/*
 * Se ejecuta cuando termina una reproducción.
 * play({ repetitions: 1 }) evita que quede en bucle.
 */

visor.addEventListener("finished", () => {
    muebleAbierto = !muebleAbierto;
    animacionEnCurso = false;

    btnAbrirTodo.disabled = false;

    btnAbrirTodo.classList.toggle(
        "activo",
        muebleAbierto
    );

    textoAbrirTodo.textContent = muebleAbierto
        ? "Cerrar"
        : "Abrir";

    btnAbrirTodo.title = muebleAbierto
        ? "Cerrar cajones y puertas"
        : "Abrir cajones y puertas";
});

/* Modelo cargado */

visor.addEventListener("load", () => {
    console.log("Modelo 3D cargado correctamente.");

    console.log(
        "Animaciones disponibles:",
        visor.availableAnimations
    );

    const tieneAnimacion =
        visor.availableAnimations.includes(nombreAnimacion);

    btnAbrirTodo.disabled = !tieneAnimacion;

    if (!tieneAnimacion) {
        console.warn(
            `El modelo no contiene ${nombreAnimacion}.`
        );
    }
});
