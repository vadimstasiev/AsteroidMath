import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import generateGalaxy from './Components/Galaxy'
import generateBgStars from './Components/BackgroundStars'
import generatePropulsionParticles from './Components/PropulsionParticles'
import { Vector3 } from 'three'

const devMode = false


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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200000)
if(devMode){
    camera.position.set(10, 2, - 10)
}
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
        const model = gltf.scene.children[0]
        model.scale.set(0.015, 0.015, 0.015)
        model.position.set(0,0,0)
        spaceshipG.add(model)
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
    size: 69,
    length: 0.3,
    spread: 1/100,
    width: 3,
    speed: 0.005
});

propulsionParticlesG.rotation.z = Math.PI/2
propulsionParticlesG.rotation.y = Math.PI/2
propulsionParticlesG.position.set(0.0,0.02,-0.5)

const spaceshipG = new THREE.Group()

spaceshipG.add(propulsionParticlesG)

spaceshipG.position.set(8,0,0)
scene.add(spaceshipG)


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
// directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
scene.add(directionalLight)

/**
 * Galaxies
 */
const galaxy1 = new THREE.Group()
scene.add(galaxy1)
galaxy1.add(generateGalaxy({
    count : 100000,
    size : 0.003,
    radius : 10,
    branches : 5,
    spin : -1,
    randomness : 1.3,
    randomnessPower : 4,
    concentration : 0.5,
    insideColor : '#ff0018',
    outsideColor : '#1b3984',
}))

const galaxy2 = new THREE.Group()
scene.add(galaxy2)
galaxy2.add(generateGalaxy({
    count: 10000,
    size: 0.001,
    radius: 7,
    branches: 2,
    spin: 1.2,
    randomness: 0.957,
    randomnessPower: 2.6,
    concentration: 0.23,
    insideColor: '#00e828',
    outsideColor: '#1b3984',
}))
galaxy2.position.set(-30, 10, -20)
galaxy2.rotation.x = Math.PI * 0.99


const galaxy3 = new THREE.Group()
scene.add(galaxy3)
galaxy3.add(generateGalaxy({
    count: 10000,
    size: 0.003,
    radius: 6.3,
    branches: 3,
    spin: -1,
    randomness: 1.3,
    randomnessPower: 4,
    concentration: 0.5,
    insideColor: '#e800a3',
    outsideColor: '#40841b',
}))
galaxy3.position.set(0, 10, 20)
galaxy3.rotation.x = Math.PI * 0.9

const galaxy4 = new THREE.Group()
scene.add(galaxy4)
galaxy4.add(generateGalaxy({
    count : 10000,
    size : 0.003,
    radius : 20,
    branches : 6,
    spin : 0.6,
    randomness : 0.8,
    randomnessPower : 4.4,
    concentration : 0.15,
    insideColor : '#e80000',
    outsideColor : '#b9926d',
}))

galaxy4.position.set(6, -2, 3)
galaxy4.rotation.x = Math.PI * 1.05

// parametersPoints2.color1 = '#ff0000'
// parametersPoints2.color2 = '#841b65'

const bgStarsG = new THREE.Group()

bgStarsG.add(generateBgStars({
    count : 7000,
    size : 0.01,
    width : 100,
}))

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

    // Update points only when the scene is ready
    if(sceneReady)
    {        
        
        // Animate Galaxy 

        const angle = elapsedTime * 0.5
        galaxy1.rotation.y = -0.01 * angle

        // Animate Spaceship trajectory

        const spaceshipSpeed = 9
        const spaceshipRadius = 6
        const ellipticDistance = 1.3
        const heightDistance = 1.3
        const heightOscilation = 6
        spaceshipG.position.x = Math.cos(elapsedTime/spaceshipSpeed)*spaceshipRadius*ellipticDistance
        spaceshipG.position.y = Math.cos(elapsedTime/heightOscilation)*heightDistance
        spaceshipG.position.z = Math.sin(elapsedTime/spaceshipSpeed)*spaceshipRadius


        const dummyPoint = new THREE.Vector3()
        const dummyPointOffset = 0.1
        dummyPoint.x = Math.cos((elapsedTime/spaceshipSpeed)+dummyPointOffset)*spaceshipRadius*ellipticDistance
        dummyPoint.y = Math.cos(elapsedTime/heightOscilation + dummyPointOffset)*heightDistance
        dummyPoint.z = Math.sin((elapsedTime/spaceshipSpeed)+dummyPointOffset)*spaceshipRadius
        spaceshipG.lookAt(dummyPoint)

        // Animate Camera position to follow spaceship


        if (!devMode){
            const cameraPosition = new THREE.Vector3()  
            // const cameraOffset = Math.abs(Math.sin(elapsedTime/10))
            const cameraOffset = 0.3
            cameraPosition.x = Math.cos((elapsedTime/spaceshipSpeed)+cameraOffset)*spaceshipRadius*ellipticDistance*0.7
            cameraPosition.y = Math.cos(elapsedTime/heightOscilation+cameraOffset)*heightDistance*1.2
            cameraPosition.z = Math.sin((elapsedTime/spaceshipSpeed)+cameraOffset)*spaceshipRadius*0.7
            camera.position.set(cameraPosition.x,cameraPosition.y, cameraPosition.z)
            controls.target = spaceshipG.position
        }
        // Animate bgStars
        
        bgStarsG.rotation.x = 0.01 * angle
        bgStarsG.rotation.y = 0.01 * angle

        // Animate Propulsion Particles

        propulsionParticles.Step();

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
    // Update orbit controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    }
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
