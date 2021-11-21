import * as THREE from 'three';
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap'
import { random } from 'gsap/gsap-core';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
)
camera.position.z = 50
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio) //提供像素scale,避免锯齿化
document.body.appendChild(renderer.domElement)

//declare properties to be interact with
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  }
}
const planeGeometry = new THREE.PlaneGeometry(world.width, world.height, world.widthSegments, world.heightSegments)
//a light is needed to make phong material visible
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true //要对每个点上色而不是整个平面上色，缺少color attribute会导致全黑
})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh)
generatePlane()

const light = new THREE.DirectionalLight(0xffffff, 0.8)
light.position.set(0, 1, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 0.8)
backLight.position.set(0, 0, -1)
scene.add(backLight)

//interactivelly modify the plane
const gui = new dat.GUI()

function generatePlane() {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments)
  
  // vertice position randomization
  const { array } = planeMesh.geometry.attributes.position
  const randomValues = []
  for (let i = 0; i < array.length; i++) {

    if (i % 3 == 0){
      const x = array[i]
      const y = array[i + 1]
      const z = array[i + 2]
  
      array[i] = x + (Math.random() - 0.5)*3
      array[i + 1] = y + (Math.random() - 0.5)*3
      array[i + 2] = z + (Math.random() - 0.5)*3
    }
    randomValues.push(Math.random()*Math.PI*2)
  }

  planeMesh.geometry.attributes.position.randomValues = randomValues
  planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array
  
  const colors = []
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4)
  }
  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

gui.add(world.plane, 'width', 1, 500).
  onChange(generatePlane)

gui.add(world.plane, 'height', 1, 500).
  onChange(generatePlane)

gui.add(world.plane, 'widthSegments', 1, 100).
  onChange(generatePlane)

gui.add(world.plane, 'heightSegments', 1, 100).
  onChange(generatePlane)

const controls = new OrbitControls(camera, renderer.domElement);

//hover over effect
const mouse = {
  x: undefined,
  y: undefined
}
addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = 1 - (event.clientY / innerHeight) * 2
  // the (0,0) of three.js is at the center
})
// raycaster as a laser point
const raycaster = new THREE.Raycaster()

let frame  = 0
// render the scene constantly
function animate() {
  requestAnimationFrame(animate) // a loop
  frame += 0.01 // count time of the loop
  // call renderer to render the scene and the camera
  renderer.render(scene, camera)
  raycaster.setFromCamera(mouse, camera)
  
  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3){
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i])*0.009
    array[i+1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1])*0.009
    array[i+2] = originalPosition[i + 2] + Math.cos(frame + randomValues[i + 2])*0.009
  }

  planeMesh.geometry.attributes.position.needsUpdate = true
  
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes
    
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        //vertice 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
        //vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)
        //vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)

        color.needsUpdate = true

      }
    })
  }
}
//renderer.render(scene, camera)
animate()


