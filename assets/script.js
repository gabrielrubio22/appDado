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
            object.position.set(0, 0, 0);
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

// Animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();