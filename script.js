let scene, camera, renderer, dice;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x003366); // Color de fondo

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Cargar texturas desde ClassicColor
    const textureLoader = new THREE.TextureLoader();
    const baseColor = textureLoader.load("ClassicColor/Die_Die_base_BaseColor.png");
    const normalMap = textureLoader.load("ClassicColor/Die_Die_base_Normal.png");
    const roughnessMap = textureLoader.load("ClassicColor/Die_Die_base_Roughness.png");
    const metalnessMap = textureLoader.load("ClassicColor/Die_Die_base_Metallic.png");

    // Material PBR
    const diceMaterial = new THREE.MeshStandardMaterial({
        map: baseColor,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        metalnessMap: metalnessMap
    });

    // Cargar modelo OBJ
    const objLoader = new THREE.OBJLoader();
    objLoader.load("Die-OBJ.obj", function (object) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = diceMaterial;
            }
        });

        dice = object;
        dice.scale.set(1.5, 1.5, 1.5);
        dice.position.y = 0.5;
        scene.add(dice);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.onload = init;
