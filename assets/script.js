// Cargar sonidos
const audioGiro = new Audio('assets/dice-roll.mp3');  // Sonido al girar
const audioThud = new Audio('assets/thud.mp3');  // Sonido al detenerse

// Verificar carga de sonidos
audioGiro.oncanplaythrough = () => console.log("Sonido de giro cargado");
audioThud.oncanplaythrough = () => console.log("Sonido de impacto cargado");

// Configuración de la escena Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);

// Cargar textura del dado
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("https://gabrielrubio22.github.io/appDado/textures/ClassicColor/Die_Die_base_BaseColor.png");

let dado = null; // Referencia al dado

// Cargar modelo y textura con OBJLoader
const mtlLoader = new THREE.MTLLoader();
mtlLoader.setPath("models/");

mtlLoader.load("Die-OBJ.mtl", function (materials) {
    materials.preload();

    for (let matName in materials.materials) {
        let mat = materials.materials[matName];
        mat.map = texture;
        mat.metalness = 0.3;
        mat.roughness = 0.7;
    }

    const objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath("models/");
    objLoader.load("Die-OBJ.obj", function (object) {
        object.scale.set(2, 2, 2);
        object.position.set(0, 0, 0);
        dado = object;
        scene.add(object);
    });
});

// Agregar ejes de referencia para depuración
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// Posición inicial de la cámara
camera.position.z = 6;

// Variables de animación
let giroActivo = false;
let tiempoInicioGiro = 0;
const tiempoMaxGiro = 1000; // 1 segundo en milisegundos

// Función para iniciar el giro del dado
function girarDado() {
    if (giroActivo || !dado) return; // Evitar múltiples giros simultáneos
    console.log("Dado lanzado");

    giroActivo = true;
    tiempoInicioGiro = Date.now();
    audioGiro.currentTime = 0;
    audioGiro.play();

    animateGiro(); // Iniciar animación
}

function detenerDado() {
    if (!dado) return;

    giroActivo = false;
    audioGiro.pause();
    audioThud.play();

    // Definir las caras correctamente
    const caras = [
        { x: 0, y: 0, valor: 6, imagen: "cara6.png" },    // Superior
        { x: -1.57, y: 0, valor: 5, imagen: "cara5.png" }, // Frontal
        { x: 0, y: -1.57, valor: 2, imagen: "cara2.png" }, // Izquierda
        { x: 1.57, y: 0, valor: 1, imagen: "cara1.png" },  // Inferior
        { x: 0, y: 1.57, valor: 3, imagen: "cara3.png" },  // Derecha
        { x: 3.14, y: 0, valor: 4, imagen: "cara4.png" }   // Atrás
    ];

    let caraAleatoria = caras[Math.floor(Math.random() * caras.length)];

    console.log(`Rotación final del dado: x=${caraAleatoria.x}, y=${caraAleatoria.y}, Cara: ${caraAleatoria.valor}`);

    let fechaHora = new Date().toLocaleString();

    new TWEEN.Tween(dado.rotation)
        .to({ x: caraAleatoria.x, y: caraAleatoria.y, z: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
        .onComplete(() => {
            let resultado = `${caraAleatoria.valor},${fechaHora}`;
            if (window.AppInventor) {
                window.AppInventor.setWebViewString(resultado);
            } else {
                console.warn("AppInventor no está definido");
            }
        });
}



// Función de animación del giro
function animateGiro() {
    if (!giroActivo || !dado) return;

    let tiempoTranscurrido = Date.now() - tiempoInicioGiro;
    console.log(`Tiempo transcurrido: ${tiempoTranscurrido} ms`); // Debug

    if (tiempoTranscurrido < tiempoMaxGiro) {
        dado.rotation.x += 0.2;
        dado.rotation.y += 0.2;
        requestAnimationFrame(animateGiro);
    } else {
        detenerDado();
    }
}

// Loop de animación general
function animate() {
    requestAnimationFrame(animate);

    try {
        if (window.TWEEN) {
            window.TWEEN.update();
        }
    } catch (error) {
        console.error("Error en TWEEN:", error);
    }

    renderer.render(scene, camera);
}
animate();

// Detectar evento shake desde MIT App Inventor
window.addEventListener("message", function (event) {
    if (event.data === "shake") {
        girarDado();
    }
});

document.getElementById("lanzarDado").addEventListener("click", girarDado);
//esto me avisa si ya se subio el cambio a github pages, solo yo lo entiendo
console.log("cambio6");