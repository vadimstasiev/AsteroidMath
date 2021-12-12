import './style.css'
import * as THREE from 'three'
import setupRenderer from './Components/Renderer'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {gsap} from 'gsap'
import {setupSpaceship, spaceshipTick} from './Components/Spaceship'
import {setupAsteroids, asteroidTick} from './Components/Asteroids'
import {setupGalaxyScene, galaxiesTick} from './Components/Galaxies'
import {setupPointsOverlay, pointOverlayTick} from './Components/AsteroidOverlay'
import {setupGame, playClicked, quitGame, setIsIntroSkipped, setIsTutSkipped, playTick} from './Components/Game'
import {setupSpaceshipOverlay, spaceshipOverlayTick} from './Components/SpaceshipOverlay'
import { setElapsedTime } from './Components/Helpers'


// If dev_freeView is enabled then the camera can be panned around manually
const dev_freeView = false


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
 * Loaders
 */
const fadeGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const fadeMaterial = new THREE.ShaderMaterial({
	transparent: true,
	uniforms:
		{
			uAlpha: {value: 1}
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
const fade = new THREE.Mesh(fadeGeometry, fadeMaterial)
scene.add(fade)
const loadingBarElement = document.querySelector('.loading-bar')
let isSceneReady = false
const loadingManager = new THREE.LoadingManager(
	// Loaded
	() => {
		// Wait a little
		window.setTimeout(() => {
			// smooth fade
			gsap.to(fadeMaterial.uniforms.uAlpha, {duration: 3, value: 0, delay: 1})

			// Update loadingBarElement
			loadingBarElement.classList.add('ended')
			// loadingBarElement.style.transform = ''
		}, 500)

		window.setTimeout(() => {
			isSceneReady = true
			/**
			 * Define callable functions once scene is ready
			 */
			onLoaderFinish()
			window.playClicked = () => playClicked(scene, camera)
			window.quitGame = () => quitGame()
			window.skipIntroduction = () => setIsIntroSkipped(true)
			window.skipTutorial = () => setIsTutSkipped(true)
		}, 2000)
	},

	// Progress
	(itemUrl, itemsLoaded, itemsTotal) => {
		// Calculate the progress and update the loadingBarElement
		const progressRatio = itemsLoaded / itemsTotal
		loadingBarElement.style.transform = `scaleX(${progressRatio})`
	}
)

/**
 * Camera
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}
const vFOV = 75
const camera = new THREE.PerspectiveCamera(vFOV, sizes.width / sizes.height, 0.1, 200000)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

if (dev_freeView) {
	camera.position.set(10, 2, -10)
	controls.enableZoom = true
} else {
	controls.enabled = false
	controls.enableZoom = false
}

scene.add(camera)


/**
 * Environment map
 */
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
const environmentMap = cubeTextureLoader.load([
	'/textures/environmentMaps/stars/px.png',
	'/textures/environmentMaps/stars/nx.png',
	'/textures/environmentMaps/stars/py.png',
	'/textures/environmentMaps/stars/ny.png',
	'/textures/environmentMaps/stars/pz.png',
	'/textures/environmentMaps/stars/nz.png'
])
environmentMap.encoding = THREE.sRGBEncoding
// scene.background = environmentMap
scene.environment = environmentMap
debugObject.envMapIntensity = 5

/**
 * Setup Multiple Components
 */

setupSpaceship(loadingManager, camera, scene, controls)
setupAsteroids(loadingManager, sizes)
setupGalaxyScene(scene)
setupPointsOverlay(scene)
setupSpaceshipOverlay(scene)
const onLoaderFinish = () => {
	setupGame(scene, camera)
}

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
 * Tick Vars
 */
const renderer = setupRenderer(canvas, sizes, camera)
const clock = new THREE.Clock()

/**
 * Animate
 */
const tick = () => {
	const elapsedTime = clock.getElapsedTime()		
	if (isSceneReady) {
        // set elapsedTime for easy access in other components
        setElapsedTime(elapsedTime)

		// Animate Galaxies
		galaxiesTick(elapsedTime)

		// Animate Spaceship trajectory
		spaceshipTick(elapsedTime, camera, controls, dev_freeView)

		// Animate Asteroids
		asteroidTick(elapsedTime, scene, camera, dev_freeView)

		// Update Asteroid Points Overlay
		pointOverlayTick(camera, sizes)

		// Update Spaceship Messages Overlay
		spaceshipOverlayTick(elapsedTime, camera, sizes)

		// Update Game
		playTick(elapsedTime, scene, camera)

		// Update orbit controls
		controls.update()

		// Render
		renderer.render(scene, camera)
		
	}
	// Call tick again on the next frame
	window.requestAnimationFrame(() => tick())
}
tick()

