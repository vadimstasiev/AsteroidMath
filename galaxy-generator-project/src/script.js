import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy Generator
 */
let geometry = null
let material = null


const generateGalaxy = (parameters, points=null) =>
{
    console.log(points)
    // Destroy old galaxy
    if(points !== null)
    {
        scene.remove(points)
    }

    /**
     * Geometry
     */
    if(geometry !== null)
    {
        geometry.dispose()
    }
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        // Position
        const i3 = i * 3

        const radius = Math.random() * parameters.radius

        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const randomX = Math.random() * (Math.random() < 0.5 ? 1 : - 1) * (((parameters.randomness / radius) /parameters.concentration)<1?((parameters.randomness / radius) /parameters.concentration):1)
        const randomY = Math.random() * parameters.randomness * Math.cos((radius/parameters.radius)*parameters.randomnessPower/2) * Math.pow((radius/parameters.radius)*parameters.randomnessPower, Math.random()) * (Math.random() < 0.5 ? 1 : - 1)
        const randomZ = Math.random() * (Math.random() < 0.5 ? 1 : - 1) * (((parameters.randomness / radius) /parameters.concentration)<1?((parameters.randomness / radius) /parameters.concentration):1)

        if (i<300 && ((parameters.randomness / radius) /parameters.concentration)>1){
            console.log(parameters.randomness , radius ,parameters.concentration,(parameters.randomness / radius) /parameters.concentration)
        }

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)
        
        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */

    if(material !== null)
    {
        material.dispose()
    }

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
    return points
}


const parametersPoints1 = {}
parametersPoints1.count = 100000
parametersPoints1.size = 0.003
parametersPoints1.radius = 10
parametersPoints1.branches = 5
parametersPoints1.spin = -1
parametersPoints1.randomness = 1.3
parametersPoints1.randomnessPower = 4
parametersPoints1.concentration = 0.5
parametersPoints1.insideColor = '#e8cc00'
parametersPoints1.outsideColor = '#1b3984'

let points1 = generateGalaxy(parametersPoints1)

const parametersPoints2 = {}
parametersPoints2.count = 51000
parametersPoints2.size = 0.004
parametersPoints2.radius = 0.97
parametersPoints2.branches = 5
parametersPoints2.spin = -17
parametersPoints2.randomness = 0.3
parametersPoints2.randomnessPower = 10
parametersPoints2.concentration = 0.7
parametersPoints2.insideColor = '#ff0000'
parametersPoints2.outsideColor = '#841b65'
let points2 = generateGalaxy(parametersPoints2)

/**
 * add Tweakable dev parametersPoints1
 */

const gui = new dat.GUI()

const points1Folder = gui.addFolder('Points_1')
points1Folder.add(parametersPoints1, 'count').min(100).max(1000000).step(100).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'radius').min(0).max(20).step(0.01).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'branches').min(2).max(20).step(1).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'spin').min(- 50).max(50).step(0.001).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'randomness').min(0).max(2).step(0.001).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.add(parametersPoints1, 'concentration').min(0.1).max(5).step(0.01).onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.addColor(parametersPoints1, 'insideColor').onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})
points1Folder.addColor(parametersPoints1, 'outsideColor').onFinishChange(()=>{points1=generateGalaxy(parametersPoints1, points1)})

const points2Folder = gui.addFolder('Points_2')
points2Folder.add(parametersPoints2, 'count').min(100).max(1000000).step(100).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'radius').min(0).max(20).step(0.01).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'branches').min(2).max(20).step(1).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'spin').min(- 50).max(50).step(0.001).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'randomness').min(0).max(2).step(0.001).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.add(parametersPoints2, 'concentration').min(0.1).max(5).step(0.01).onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.addColor(parametersPoints2, 'insideColor').onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})
points2Folder.addColor(parametersPoints2, 'outsideColor').onFinishChange(()=>{points2=generateGalaxy(parametersPoints2, points2)})

/**
 * Resize canvas when window is resized
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()