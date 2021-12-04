import * as THREE from 'three'
import { Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import generatePropulsionParticles from './PropulsionParticles'

const spaceshipG = new THREE.Group()
const spaceShipParams = {
    // Default Spaceship Orbit Parameters:
    spaceshipDestroyed: false,
    timeBeforeRespawn: 10,
    spaceshipRespawnedTime: 0,
    spaceshipRespawning: false,
    spaceshipSpeed: 9,
    spaceshipRadius: 6,
    spaceshipEllipticOffset: 1.3,
    spaceshipAmplitudeY: 1.3,
    spaceshipOscilationY: 6,
    dummyPointOffset: 0.1,
    latestSpaceshipPosition: [0,0,0],
    latestSpaceshipDummyPosition: [0,0,0]
}

const cameraParams = {
    // Default Camera Orbit Parameters:
    cameraLookPosition: new Vector3(),
    cameraDummyPoint: new Vector3(),
    cameraDummyPointOffset: 0, 
    latestCameraPosition: [0,0,0],
    cameraToSpaceshipOffset: 0.4,
    cameraRadiusMultiplier: 0.7,
    cameraAmplitudeOffset: 1.2,
}

let propulsionParticles;

const setupSpaceship = (loadingManager, camera, scene, controls) => {
    cameraParams.camera = camera
    cameraParams.controls = controls
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Spaceship/Spaceship.gltf',
        (gltf) =>
        {
            const model = gltf.scene.children[0]
            model.scale.set(0.015, 0.015, 0.015)
            model.position.set(0,0,0)
            spaceshipG.add(model)
        }
    )
    /**
     * Spaceship propulsion particle system
     */
    const propulsionParticlesG = new THREE.Group()
    spaceshipG.add(propulsionParticlesG)
    propulsionParticles = new generatePropulsionParticles({
        parent: propulsionParticlesG,
        camera: camera,
        size: 69,
        length: 0.3,
        spread: 1/100,
        width: 3,
        speed: 0.005,
        innerColor: 0xff80ff,
        outterColor: 0x007bff
    })

    propulsionParticlesG.rotation.z = Math.PI/2
    propulsionParticlesG.rotation.y = Math.PI/2
    propulsionParticlesG.position.set(0.0,0.02,-0.5)


    spaceshipG.position.set(8,0,0)
    scene.add(spaceshipG)
    cameraParams.cameraLookPosition = cameraParams.cameraDummyPoint
}

const calculateSpaceshipPosition = (elapsedTime, offset = 0) => {
    const x = Math.cos((elapsedTime+offset)/spaceShipParams.spaceshipSpeed)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset
    const y = Math.cos((elapsedTime+offset)/spaceShipParams.spaceshipOscilationY)*spaceShipParams.spaceshipAmplitudeY
    const z = Math.sin((elapsedTime+offset)/spaceShipParams.spaceshipSpeed)*spaceShipParams.spaceshipRadius
    return [x,y,z]
}

// Animate Camera position to follow a similar trajectory as the spaceship
const calculateCameraPosition = (elapsedTime) => {
    cameraParams.cameraToSpaceshipOffset = Math.abs(Math.sin(elapsedTime/10))/2
    const x = Math.cos((elapsedTime/spaceShipParams.spaceshipSpeed)+cameraParams.cameraToSpaceshipOffset)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset*cameraParams.cameraRadiusMultiplier
    const y = Math.cos(elapsedTime/spaceShipParams.spaceshipOscilationY+cameraParams.cameraToSpaceshipOffset)*spaceShipParams.spaceshipAmplitudeY*cameraParams.cameraAmplitudeOffset
    const z = Math.sin((elapsedTime/spaceShipParams.spaceshipSpeed)+cameraParams.cameraToSpaceshipOffset)*spaceShipParams.spaceshipRadius*cameraParams.cameraRadiusMultiplier
    return [x,y,z]
}

const spaceshipDestroy = (scene, elapsedTime) => {
    scene.remove(spaceshipG)
    spaceShipParams.spaceshipDestroyed = true
    setTimeout(()=>spaceshipRespawn(scene, elapsedTime), spaceShipParams.timeBeforeRespawn*1000)
}

const spaceshipRespawn = (scene, elapsedTime) => {
    scene.add(spaceshipG)
    spaceShipParams.spaceshipRespawnedTime = elapsedTime
    spaceShipParams.spaceshipRespawning = true
}

let lerpFactor=0
let previousRAF
const spaceshipTick = (elapsedTime, camera, controls, freeView) => {
    const deltaTime = (elapsedTime*1000 - previousRAF)
    if(propulsionParticles){
        propulsionParticles.Step(deltaTime)
    }
    if (previousRAF === null) {
		previousRAF = elapsedTime*1000;
	}
    // Set Spaceship Position
    spaceShipParams.latestSpaceshipPosition = calculateSpaceshipPosition(elapsedTime)
    spaceshipG.position.set(...spaceShipParams.latestSpaceshipPosition)
    // Set Spaceship Rotation by making it look at a point that is + dummyPointOffset ahead
    spaceShipParams.latestSpaceshipDummyPosition = calculateSpaceshipPosition(elapsedTime, spaceShipParams.dummyPointOffset)
    const dummyPoint = new THREE.Vector3(...spaceShipParams.latestSpaceshipDummyPosition)
    spaceshipG.lookAt(dummyPoint)

    
    // check if the freeView is enabled before forcing updates to the camera position, useful for dev
    if (!freeView){
        // Camera Position
        cameraParams.latestCameraPosition = calculateCameraPosition(elapsedTime)
        camera.position.set(...cameraParams.latestCameraPosition)

        // Camera Rotation
        // camera looks at this point (rotation) when following the spaceship
        cameraParams.cameraDummyPoint.set(...calculateSpaceshipPosition(elapsedTime, cameraParams.cameraDummyPointOffset))
        
        if(spaceShipParams.spaceshipRespawning){
            const lerpStep=0.001
            lerpFactor+=lerpStep*deltaTime
            controls.target = cameraParams.cameraLookPosition
            if(lerpFactor<=1){
                cameraParams.controls.target = cameraParams.cameraLookPosition.clone().lerp(cameraParams.cameraDummyPoint, lerpFactor)
            } 
            else {
                spaceShipParams.spaceshipRespawning = false
                spaceShipParams.spaceshipDestroyed = false
                lerpFactor = 0
            }
        }
        if(!spaceShipParams.spaceshipDestroyed) {
            controls.target = cameraParams.cameraLookPosition
        } 
    }
    previousRAF = elapsedTime*1000
}

export {spaceshipG, setupSpaceship, spaceshipTick, spaceShipParams, cameraParams, calculateSpaceshipPosition, spaceshipDestroy}
