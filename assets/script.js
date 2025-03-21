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

    // Configurar materiales manualmente
    for (let matName in materials.materials) {
        let mat = materials.materials[matName];
        mat.transparent = false;
        mat.opacity = 1;
        mat.map = texture;  // Aplicar la textura manualmente
        mat.emissive = new THREE.Color(0x111111); // Leve iluminación propia
        mat.metalness = 0.3;
        mat.roughness = 0.7;
    }

    const objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath("models/");
    
    objLoader.load(
        "Die-OBJ.obj",
        function (object) {
            object.scale.set(2, 2, 2);
            object.position.set(0, 0, 0);  // Centrado
            dado = object;
            scene.add(object);
        },
        function (xhr) {
            console.log(`Cargando modelo: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        function (error) {
            console.error("Error cargando el modelo:", error);
        }
    );
});

// Posición de la cámara
camera.position.z = 6;

// Variables para el movimiento
let giroActivo = false;
let vueltas = 0;
let velocidadGiro = 0.05;  // Ajusta la velocidad del giro
let maxVueltas = 3;  // Número de vueltas que debe dar el dado

// Función para controlar el movimiento y sonido
function girarDado() {
    if (!giroActivo) {
        giroActivo = true;
        audioGiro.play(); // Reproducir sonido de giro
    }

    // Hacer girar el dado
    dado.rotation.x += velocidadGiro;
    dado.rotation.y += velocidadGiro;

    vueltas++;

    // Detener giro después de 3 vueltas
    if (vueltas >= maxVueltas) {
        giroActivo = false;
        audioGiro.pause();  // Detener el sonido de giro
        audioThud.play();   // Reproducir el sonido de impacto (thud)
    }
}

// Detectar movimiento del dispositivo (agitar celular)
if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", function(event) {
        const acceleration = event.accelerationIncludingGravity;  // Mejor uso de aceleración
        // Si la aceleración es suficientemente alta, activar el giro
        if (Math.abs(acceleration.x) > 10 || Math.abs(acceleration.y) > 10 || Math.abs(acceleration.z) > 10) {
            if (!giroActivo) {
                vueltas = 0;  // Reiniciar el número de vueltas
                girarDado();
            }
        }
    });
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
