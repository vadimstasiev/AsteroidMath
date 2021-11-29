import './style.css'
import * as THREE from 'three'
import setupRenderer from './Components/Renderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'
import {setupSpaceship, spaceshipTick} from './Components/Spaceship'
import {setupGalaxyScene, galaxiesTick} from './Components/Galaxies'
import {playClicked, asteroidTick} from './Components/Game'


// If freeView is enabled then the camera can be panned around manually
const freeView = false

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')
let isSceneReady = false
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Wait a little
        window.setTimeout(() =>
        {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        }, 500)

        window.setTimeout(() =>
        {
            isSceneReady = true
        }, 2000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)


/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
const vFOV = 75
const camera = new THREE.PerspectiveCamera(vFOV, sizes.width / sizes.height, 0.1, 200000)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

if(freeView) {
    camera.position.set(10, 2, - 10)
    controls.enableZoom = true
} else {
    controls.enableZoom = false
}

scene.add(camera)



/**
 * Overlay (html overlay)
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})

 const raycaster = new THREE.Raycaster()
 const points = [
     {
         position: new THREE.Vector3(10, 10, 2),
         element: document.querySelector('.point-0')
     },
     {
         position: new THREE.Vector3(0.5, 0.8, - 1.6),
         element: document.querySelector('.point-1')
     },
     {
         position: new THREE.Vector3(1.6, - 1.3, - 0.7),
         element: document.querySelector('.point-2')
     }
 ]

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)



/**
 * Environment map
 */
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/stars/px.jpg',
    '/textures/environmentMaps/stars/nx.jpg',
    '/textures/environmentMaps/stars/py.jpg',
    '/textures/environmentMaps/stars/ny.jpg',
    '/textures/environmentMaps/stars/pz.jpg',
    '/textures/environmentMaps/stars/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding
scene.environment = environmentMap
debugObject.envMapIntensity = 5

/**
 * Models
 */

const {spaceshipG, propulsionParticles} = setupSpaceship(loadingManager, camera)
scene.add(spaceshipG)



/**
 * Lights
 */
const directionalLight1 = new THREE.DirectionalLight('#ffffff', 0.5)
directionalLight1.position.set(0, 1, 0)
scene.add(directionalLight1)

const directionalLight2 = new THREE.DirectionalLight('#ffffff', 0.5)
directionalLight2.position.set(0, -1, 0)
scene.add(directionalLight2)

const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.3)
scene.add(ambientLight)

/**
 * Galaxies
 */
setupGalaxyScene(scene)





/**
 * Vars
 */
const renderer = setupRenderer(canvas, sizes, camera)
const clock = new THREE.Clock()
let previousRAF
let elapsedTime = 0
let oldElapsedTime = 0

/**
 * Define callable functions
 */

window.playClicked = () => playClicked(elapsedTime, scene, camera, spaceshipG)

/**
 * Animate
 */
const tick = (t) =>
{
    elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime
    if (previousRAF === null) {
        previousRAF = t;
    }
    propulsionParticles.Step(t-previousRAF)
    if(isSceneReady)
    {        
        // Animate Galaxies
        galaxiesTick(elapsedTime)

        // Animate Spaceship trajectory

        spaceshipTick(elapsedTime, camera, controls, freeView)

        // Animate Asteroids
        asteroidTick(elapsedTime, scene)

        // Go through each html point
        for(const point of points)
        {
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)
            point.element.classList.add('visible')
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
        // Update orbit controls
        controls.update()

        // Render
        renderer.render(scene, camera)
        previousRAF = t
    }
    // Call tick again on the next frame
    window.requestAnimationFrame(t => tick(t))
}

tick()
