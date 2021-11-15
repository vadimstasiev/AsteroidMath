import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import generateGalaxy from './Components/Galaxy'
import generateBgStars from './Components/BackgroundStars'
import generatePropulsionParticles from './Components/PropulsionParticles'
import { Vector3 } from 'three'
/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')

let sceneReady = false
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
            sceneReady = true
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
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(10, 2, - 10)
scene.add(camera)



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Overlay
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
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
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
gltfLoader.load(
    '/models/Spaceship/glTF/Spaceship.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.1, 0.1, 0.1)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)


/**
 * Spaceship propulsion particle system
 */
const propulsionParticlesG = new THREE.Group()


const propulsionParticles = new generatePropulsionParticles({
    parent: propulsionParticlesG,
    camera: camera,
    size: 78,
    length: 0.7
});

propulsionParticlesG.rotation.z = (Math.PI/2) * 3
propulsionParticlesG.position.set(2,-4.5,12.5)

scene.add(propulsionParticlesG)



/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster()
const points = [
    // {
    //     position: new THREE.Vector3(1.55, 0.3, - 0.6),
    //     element: document.querySelector('.point-0')
    // },
    // {
    //     position: new THREE.Vector3(0.5, 0.8, - 1.6),
    //     element: document.querySelector('.point-1')
    // },
    // {
    //     position: new THREE.Vector3(1.6, - 1.3, - 0.7),
    //     element: document.querySelector('.point-2')
    // }
]

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
scene.add(directionalLight)

/**
 * Galaxies
 */

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



const points1 = generateGalaxy(parametersPoints1)

const parametersPoints2 = {}
parametersPoints2.count = 51000
parametersPoints2.size = 0.006
parametersPoints2.radius = 0.97
parametersPoints2.branches = 5
parametersPoints2.spin = -17
parametersPoints2.randomness = 0.3
parametersPoints2.randomnessPower = 10
parametersPoints2.concentration = 0.7
parametersPoints2.insideColor = '#ff0000'
parametersPoints2.outsideColor = '#841b65'
const points2 = generateGalaxy(parametersPoints2)

const galaxiesG = new THREE.Group()
galaxiesG.add(points1)
galaxiesG.add(points2)
scene.add(galaxiesG)

const bgStarsParameters = {}
bgStarsParameters.count = 7000
bgStarsParameters.size = 0.01
bgStarsParameters.width = 100
parametersPoints2.color1 = '#ff0000'
parametersPoints2.color2 = '#841b65'

const bgStars = generateBgStars(bgStarsParameters)


const bgStarsG = new THREE.Group()
bgStarsG.add(bgStars)
scene.add(bgStarsG)


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
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = clock.getDelta ()
    // Update controls
    controls.update()
    // Update points only when the scene is ready
    if(sceneReady)
    {
        // Animate Galaxy 

        const angle = elapsedTime * 0.5
        galaxiesG.rotation.y = -0.01 * angle

        // Animate bgStars

        
        bgStarsG.rotation.x = 0.01 * angle
        bgStarsG.rotation.y = 0.01 * angle

        // Propulsion Particles


        propulsionParticles.Step(0.01);

        // Go through each html point
        for(const point of points)
        {
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)
    
            // Set the raycaster
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)
    
            // No intersect found
            if(intersects.length === 0)
            {
                // Show
                point.element.classList.add('visible')
            }

            // Intersect found
            else
            {
                // Get the distance of the intersection and the distance of the point
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)
    
                // Intersection is close than the point
                if(intersectionDistance < pointDistance)
                {
                    // Hide
                    point.element.classList.remove('visible')
                }
                // Intersection is further than the point
                else
                {
                    // Show
                    point.element.classList.add('visible')
                }
            }
    
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
