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
//const texture = textureLoader.load("./textures/Red-White/Die_Die_base_BaseColor.png");

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


// Posición inicial de la cámara
camera.position.z = 6;

// Variables de animación
let giroActivo = false;
let tiempoInicioGiro = 0;
const tiempoMaxGiro = 1000; // 3 segundos en milisegundos

// Función para iniciar el giro del dado
function girarDado() {
    if (!giroActivo && dado) {
        giroActivo = true;
        tiempoInicioGiro = Date.now();
        audioGiro.currentTime = 0;
        audioGiro.play();

        animateGiro(); // Inicia la animación de giro
    }
}

// Función para detener el dado en una cara aleatoria suavemente
function detenerDado() {
    if (!dado) return;

    giroActivo = false;
    audioGiro.pause();
    audioThud.play();

    // Definir posiciones de caras del dado
    const caras = [
        { x: 0, y: 0 },
        { x: Math.PI / 2, y: 0 },
        { x: -Math.PI / 2, y: 0 },
        { x: Math.PI, y: 0 },
        { x: 0, y: Math.PI / 2 },
        { x: 0, y: -Math.PI / 2 }
    ];

    let caraAleatoria = caras[Math.floor(Math.random() * caras.length)];

    // Usar TWEEN.js para animar la rotación hasta la cara aleatoria
    new TWEEN.Tween(dado.rotation)
        .to({ x: caraAleatoria.x, y: caraAleatoria.y, z: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

// Función de animación del giro
function animateGiro() {
    if (!giroActivo) return;

    let tiempoTranscurrido = Date.now() - tiempoInicioGiro;

    if (tiempoTranscurrido < tiempoMaxGiro) {
        // Girar el dado continuamente
        dado.rotation.x += 0.2;
        dado.rotation.y += 0.2;
        requestAnimationFrame(animateGiro);
    } else {
        detenerDado(); // Detener después de 3 segundos
    }
}

// Loop de animación general
function animate() {
    requestAnimationFrame(animate);
    if (window.TWEEN) TWEEN.update(); // Asegurar que las animaciones de TWEEN funcionen
    renderer.render(scene, camera);
}
animate();

// Detectar evento shake desde MIT App Inventor
window.addEventListener("message", function (event) {
    if (event.data === "shake") {
        girarDado();
    }
});
