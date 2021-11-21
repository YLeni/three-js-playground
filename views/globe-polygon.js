import * as THREE from 'three';
//import countries from './countries.geojson'
import { GLOBE_RADIUS } from '../utils/constants.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { ConicPolygonGeometry } from 'three-conic-polygon-geometry';
import ThreeGlobe from 'three-globe';
import {includeCountries} from '../data/countrylist.js'

fetch('../data/countries.geoJson').then(res => res.json()).then(countries => {
    const countryList = countries.features
    const GlobeList = []

    countryList.forEach((element,index) => {
        const Globe = new ThreeGlobe
        if (index == 0){
            Globe
            //.globeImageUrl('./img/uv-earth-map-light.jpeg')
            .polygonsData([element])
            .polygonCapColor(() => 'rgba(200, 0, 0, 0.7)')
            .polygonSideColor(() => 'rgba(0, 200, 0, 0.1)')
            .polygonStrokeColor(() => '#111')
            .showGlobe(true);
        }
        else{
            Globe
            .polygonsData([element])
            .polygonCapColor(() => 'rgba(200, 0, 0, 0.7)')
            .polygonSideColor(() => 'rgba(0, 200, 0, 0.1)')
            .polygonStrokeColor(() => '#111')
            .showAtmosphere(false)
            .showGlobe(false);
        }
        GlobeList.push(Globe)
    });
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xbbbbbb));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

    GlobeList.forEach(mesh=>{
        scene.add(mesh)
    })

    // Setup camera
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;

    // Add camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.keys = {
        LEFT: 'ArrowLeft', //left arrow
        UP: 'ArrowUp', // up arrow
        RIGHT: 'ArrowRight', // right arrow
        BOTTOM: 'ArrowDown' // down arrow
    }
    //controls.autoRotate = true
    //controls.autoRotateSpeed = 2
    //controls.listenToKeyEvents (window) 
    //controls.screenSpacePanning = false
    
    let index = 1;
    // Kick-off renderer
    function animate() { // IIFE
        // Frame cycle
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    addEventListener('click', (event) => {
        let exampleLength = 3
        GlobeList.forEach((mesh,index)=>{
            if (index < exampleLength){
                setTimeout(() => mesh.polygonAltitude(Math.random), 1000*(index+1));
                renderer.render(scene, camera);
            }
            else{
                setTimeout(() => mesh.polygonAltitude(Math.random), 1000*(exampleLength+1));
                renderer.render(scene, camera);
            }
        })
    })

    addEventListener('keydown', (event) => {
        GlobeList.forEach((mesh)=>{
            mesh.polygonAltitude(0.05);
            renderer.render(scene, camera);
        })
    })
});