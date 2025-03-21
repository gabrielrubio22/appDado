// Cargar sonidos
const audioGiro = new Audio('assets/dice-roll.mp3');  // Sonido al girar
const audioThud = new Audio('assets/thud.mp3');  // Sonido al detenerse

// Verificar si los sonidos se cargan correctamente
audioGiro.oncanplaythrough = () => console.log("Sonido de giro cargado");
audioThud.oncanplaythrough = () => console.log("Sonido de impacto cargado");

audioGiro.onerror = () => console.log("Error cargando sonido de giro");
audioThud.onerror = () => console.log("Error cargando sonido de impacto");

// Configuración básica de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Iluminación mejorada
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);

// Cargar textura manualmente
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("textures/Red-White/Die_Die_base_BaseColor.png");

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
    },
    function (xhr) {
        const progreso = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
        console.log(`Cargando modelo: ${progreso}%`);
    },
    function (error) {
        console.error("Error cargando el modelo:", error);
    });
});

// Posición de la cámara
camera.position.z = 6;

// Variables para el movimiento
giroActivo = false;
velocidadGiro = 0;
const maxVelocidad = 0.2;
const aceleracion = 0.01;
const frenado = 0.005;
let tiempoGiro = 0;

// Función para girar el dado
function girarDado() {
    if (!giroActivo && dado) {
        giroActivo = true;
        velocidadGiro = 0.02;
        tiempoGiro = 0;
        if (audioGiro.paused) {
            audioGiro.currentTime = 0;
            audioGiro.play();
        }
    }
}

// Función para detener el dado
function detenerDado() {
    if (giroActivo && velocidadGiro <= 0) {
        giroActivo = false;
        audioGiro.pause();
        audioThud.play();

        const caras = [
            { x: 0, y: 0 },
            { x: Math.PI / 2, y: 0 },
            { x: -Math.PI / 2, y: 0 },
            { x: Math.PI, y: 0 },
            { x: 0, y: Math.PI / 2 },
            { x: 0, y: -Math.PI / 2 }
        ];
        let caraAleatoria = caras[Math.floor(Math.random() * caras.length)];
        if (dado) {
            dado.rotation.x = caraAleatoria.x;
            dado.rotation.y = caraAleatoria.y;
        }
    }
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    if (giroActivo && dado) {
        if (velocidadGiro < maxVelocidad) {
            velocidadGiro += aceleracion;
        } else {
            tiempoGiro++;
        }
        if (tiempoGiro > 60) {
            velocidadGiro -= frenado;
            if (velocidadGiro <= 0) {
                detenerDado();
            }
        }
        dado.rotation.x += velocidadGiro;
        dado.rotation.y += velocidadGiro;
    }
    renderer.render(scene, camera);
}
animate();

// Detección de evento shake
document.addEventListener("shake", function () {
    if (!giroActivo) {
        girarDado();
    }
});

// Simulación de shake con App Inventor
window.addEventListener("message", function (event) {
    if (event.data === "shake") {
        girarDado();
    }
});
