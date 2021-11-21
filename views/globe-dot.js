import * as THREE from 'three';
import { path } from '../utils/path.js'
import { GLOBE_RADIUS, CURVE_COLOR, COLOR_SPHERE } from '../utils/constants.js'
import Curve from '../utils/curve.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import ThreeGlobe from 'three-globe';
//import { _numWithUnitExp } from 'gsap/gsap-core';

// initialize the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
)
const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
    }
)
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio) //提供像素scale,避免锯齿化
document.body.appendChild(renderer.domElement)
camera.position.z = 200
const rootMesh = new THREE.Mesh();

// // add the globe
fetch('../data/countries_medium_resolution.geo.json').then(res => res.json()).then(countries => {
    const Globe = new ThreeGlobe
    Globe
        //.globeImageUrl('./img/uv-earth-map-light.jpeg')
        .polygonsData(countries.features)
        .polygonCapColor(() => 'rgba(255,255,255, 1)')
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(() => 'rgba(255,255,255, 1)')
        .showAtmosphere(false)
        .showGlobe(false)
        .polygonCapMaterial(new THREE.MeshPhongMaterial({
            opacity: 0.3,
            transparent: true,
        }))
    Globe.polygonAltitude(0)
    rootMesh.add(Globe)
}
)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 50, 50), //geometry
    new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('../img/uv-earth-map-white.jpeg'), //material
    })
);
//rootMesh.add(sphere);

// add curve and dot
const curveMaterial = new THREE.MeshBasicMaterial({
    opacity: 0.6,
    transparent: true,
    color: CURVE_COLOR
});
const curveMeshContainer = new THREE.Mesh();
const pointsPathArray = [];
const dotMeshContainer = new THREE.Mesh();
const dotMaterial = new THREE.MeshPhongMaterial(
    {
        color: 0xffff00,
        opacity: 0,
        transparent: true
    }
);
const dotMeshArray = [];
let fraction = 0
path.forEach((coords, index) => {
    // calculate curve positions
    const curve = new Curve(coords, curveMaterial);
    //const curveMesh = curve.mesh;
    const pointsPath = curve.pointsPath
    pointsPathArray.push(pointsPath)
    //curveMeshContainer.add(curveMesh);

    //add flying dots
    const initialPosition = pointsPath.getPoint(fraction)
    const dot = new THREE.SphereGeometry(2, 10, 10)
    const dotMesh = new THREE.Mesh(dot, dotMaterial)
    dotMesh.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
    dotMeshArray.push(dotMesh)
    dotMeshContainer.add(dotMesh)
});

//rootMesh.add(curveMeshContainer);
rootMesh.add(dotMeshContainer);
//rootMesh.rotateX(62)
scene.add(rootMesh);

// add bloom effect
const params = {
    exposure: 1,
    bloomStrength: 0.5,
    bloomThreshold: 0,
    bloomRadius: 1
};
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// add lighting
const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 100);  //反映原本的颜色，第三位越高越亮
scene.add(light);

//add camera movement interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.keys = {
    LEFT: 'ArrowLeft', //left arrow
    UP: 'ArrowUp', // up arrow
    RIGHT: 'ArrowRight', // right arrow
    BOTTOM: 'ArrowDown' // down arrow
}
controls.object.position.set(169, 88, -60);

controls.update();
controls.screenSpacePanning = false
// controls.addEventListener( "change", event => {  
//     console.log( controls.object.position ); 
// } )
// render the scene constantly
function animate() {
    requestAnimationFrame(animate) // a loop
    composer.render();
    controls.update()
}
animate()

function animateDot() {
    requestAnimationFrame(animateDot) // a loop
    if (fraction < 1) {
        pointsPathArray.forEach((path, index) => {
            const dotMesh = dotMeshArray[index]
            const newPosition = path.getPoint(fraction)
            dotMesh.position.set(newPosition.x, newPosition.y, newPosition.z)
        })
    }
    fraction += 0.01
    composer.render();
}

addEventListener('click', (event) => {
    animateDot()
})

let opacity = 0

function fadeinDot() {
    requestAnimationFrame(fadeinDot) // a loop
    if (opacity < 1) {
        dotMeshArray.forEach((dot, index) => {
            dot.material.opacity = opacity;
        })
    }
    opacity += 0.03
    composer.render();
}

addEventListener('keydown', (event) => {
    const keyName = event.key;
    console.log(keyName)
    fadeinDot()

})