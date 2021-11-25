import * as THREE from 'three';
import { path } from '../utils/path.js'
import { GLOBE_RADIUS, CURVE_COLOR, COLOR_SPHERE } from '../utils/constants.js'
import Curve from '../utils/curve.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import ThreeGlobe from 'three-globe';
import * as dat from 'dat.gui'

//import { _numWithUnitExp } from 'gsap/gsap-core';

//globe material parameters
const sceneParams = {
    exposure: 1,
    color:0x0
}
const globeParams = {
    transmission: 1,
    opacity: 1,
    metalness: 0,
    roughness: 0,
    ior: 2,
    thickness: 0.01,
    specularIntensity: 1,
    specularColor: 0xffffff,
    envMapIntensity: 0.3,
    lightIntensity: 1
};

const polygonParams = {
    metalness: 1,
    roughness: 0.4,
    color: 0xffffff,
    emissive: 0x0,
    envMapIntensity: 1
}

// initialize the scene
// set camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
)
camera.position.z = 200

//set renderer
const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
    }
)
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(window.devicePixelRatio) //提供像素scale,避免锯齿化
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = sceneParams.exposure;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement)

// add bloom effect
const params = {
    exposure: 1,
    bloomStrength: 0.1,
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

//add globe
const rootMesh = new THREE.Mesh();

const hdrEquirect = new RGBELoader()
    .setPath('../textures/')
    .load('royal_esplanade_1k.hdr', function () {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        animate();

    });
//scene.background = hdrEquirect;
//scene.background = new THREE.Color('0xffffff');

//polygon material parameters
fetch('../data/countries_medium_resolution.geo.json').then(res => res.json()).then(countries => {
    const Globe = new ThreeGlobe
    // set globe
    Globe
        .showAtmosphere(false)
        .showGlobe(true)
        .globeMaterial(new THREE.MeshPhysicalMaterial({
            metalness: globeParams.metalness,
            roughness: globeParams.roughness,
            ior: globeParams.ior,
            envMap: hdrEquirect,
            envMapIntensity: globeParams.envMapIntensity,
            transmission: globeParams.transmission, // use material.transmission for glass materials
            specularIntensity: globeParams.specularIntensity,
            opacity: globeParams.opacity,
            side: THREE.DoubleSide,
            transparent: true
        }))

    const GlobeMaterial = Globe.globeMaterial()
    // set polygon
    Globe
        .polygonsData(countries.features)
        .polygonCapColor(() => 'rgba(255,255,255, 1)')
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(() => 'rgba(0, 0, 0, 0)')
        .polygonAltitude(0.008)
        .polygonCapMaterial(new THREE.MeshPhysicalMaterial({
            color: polygonParams.color,
            side: THREE.DoubleSide,
            metalness: 1,
            envMap: hdrEquirect,
            envMapIntensity: polygonParams.envMapIntensity,
        }))
    rootMesh.add(Globe)

    //set gui
    const gui = new dat.GUI()

    gui.addColor( sceneParams, 'color' ).name('背景颜色')
        .onChange( function () {
            scene.background = new THREE.Color(sceneParams.color)
            composer.render()

        } );
    //海洋属性
    gui.add(globeParams, 'transmission', 0, 1, 0.01).name('海洋透光度')
        .onChange(function () {
            Globe.globeMaterial().transmission = globeParams.transmission
            composer.render();

        });
    gui.add(globeParams, 'opacity', 0, 1, 0.01).name('海洋不透明度')
        .onChange(function () {
            Globe.globeMaterial().opacity = globeParams.opacity
            composer.render();
        });
    gui.add(globeParams, 'envMapIntensity', 0, 1, 0.01).name('海洋反射强度')
        .onChange(function () {
            Globe.globeMaterial().envMapIntensity = globeParams.envMapIntensity
            composer.render();
        });
    gui.add(globeParams, 'ior', 1, 2, 0.01).name('海洋折射率')
        .onChange(function () {
            Globe.globeMaterial().ior = globeParams.ior
            composer.render();
        });

    //陆地属性    
    gui.add(polygonParams, 'metalness', 0, 1, 0.01).name('陆地金属感')
        .onChange(function () {
            Globe.polygonCapMaterial().metalness = polygonParams.metalness
            composer.render();

        });
    gui.add(polygonParams, 'roughness', 0, 1, 0.01).name('陆地粗糙度')
        .onChange(function () {
            Globe.polygonCapMaterial().roughness = polygonParams.roughness
            composer.render();

        });
    gui.add(polygonParams, 'envMapIntensity', 0, 1, 0.01).name('陆地反射亮度')
        .onChange(function () {
            Globe.polygonCapMaterial().envMapIntensity = polygonParams.envMapIntensity
            composer.render();
        });
    gui.add(polygonParams, 'ior', 0, 1, 0.01).name('陆地反射模糊度')
        .onChange(function () {
            Globe.polygonCapMaterial().ior = polygonParams.ior
            composer.render();
        });
    gui.open();
}
)

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
        transparent: true,
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

// add lighting
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

// addEventListener('click', (event) => {
//     animateDot()
// })

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