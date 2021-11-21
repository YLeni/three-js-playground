import * as THREE from 'three';
import { path } from '../utils/path.js'
import { GLOBE_RADIUS, CURVE_COLOR, COLOR_SPHERE } from '../utils/constants.js'
import Curve from '../utils/curve.js';
import Tube from '../utils/tube.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CURVE_SEGMENTS, DRAW_TUBE_RANGE_DELTA } from '../utils/constants.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

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

// add the globe
// const mesh = new THREE.Mesh(geometry, material);
const rootMesh = new THREE.Mesh();
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 50, 50), //geometry
    new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('../img/uv-earth-map-white.jpeg'), //material
        //color: COLOR_SPHERE
    })
);
rootMesh.add(sphere)

// add curve
//console.log(path)
const curveMaterial = new THREE.MeshBasicMaterial({
    //blending: THREE.AdditiveBlending,
    opacity: 0.6,
    transparent: true,
    color: CURVE_COLOR
});
// mesh for each curve
const curveMeshContainer = new THREE.Mesh();
const curveMeshArray = []
path.forEach((coords, index) => {
        console.log(coords)
        const curve = new Tube(coords, curveMaterial);
        const curveMesh = curve.mesh
        curveMeshContainer.add(curveMesh);
        curveMeshArray.push(curveMesh)
});
rootMesh.add(curveMeshContainer);
scene.add(rootMesh);

// add bloom effect
const params = {
    exposure: 1,
    bloomStrength: 0,
    bloomThreshold: 0,
    bloomRadius: 0
};
const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

// add lighting
const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);  //反映原本的颜色，第三位越高越亮
// const light = new THREE.PointLight( 0xffffff, 0xffffff, 2 );
// light.position.set( 0, 0, 0 );
scene.add(light);

//add camera movement interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.keys = {
	LEFT: 'ArrowLeft', //left arrow
	UP: 'ArrowUp', // up arrow
	RIGHT: 'ArrowRight', // right arrow
	BOTTOM: 'ArrowDown' // down arrow
}
controls.autoRotate = true
controls.autoRotateSpeed = 2
//controls.listenToKeyEvents (window) 
controls.screenSpacePanning = false

// render the scene constantly
function animate() {
    requestAnimationFrame(animate) // a loop
    composer.render();
    //renderer.render(scene, camera)
    controls.update()
}
animate()

//line animation triggered by interaction
let drawCount = 2
function animateLine (){
    requestAnimationFrame(animateLine) // a loop
    drawCount ++ 
    if (drawCount < CURVE_SEGMENTS){
        curveMeshArray.forEach((mesh,index)=>{
            //if line
            //mesh.geometry.setDrawRange(0,drawCount);
            //if tueb
            mesh.geometry.setDrawRange(0,drawCount*DRAW_TUBE_RANGE_DELTA)
        })
    }
    composer.render();
    //renderer.render(scene, camera)
}

addEventListener('click', (event) => {
   animateLine()
})

