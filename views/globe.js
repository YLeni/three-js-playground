import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.130.1-bsY6rEPcA1ZYyZeKdbHd/mode=imports/optimized/three.js';
import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import atmosphereVertexShader from '../shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from '../shaders/atmosphereFragment.glsl'

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

// create the globe
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5,50,50),
  // new THREE.MeshBasicMaterial({
  //   map: new THREE.TextureLoader().load('./img/uv-earth-map.jpeg')
  // })
  new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load('../img/uv-earth-map.jpeg')
      }
    }
  })
)

scene.add(sphere)


//create the atomasphere

const  atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5,50,50),
  // new THREE.MeshBasicMaterial({
  //   map: new THREE.TextureLoader().load('./img/uv-earth-map.jpeg')
  // })
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
)

atmosphere.scale.set(1.1,1.1,1.1)

scene.add(atmosphere)

camera.position.z = 15

// render the scene constantly
function animate() {
  requestAnimationFrame(animate) // a loop
  renderer.render(scene,camera)
  sphere.rotation.y+=0.001
}
animate()