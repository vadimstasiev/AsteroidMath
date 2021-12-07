import * as THREE from 'three'
import { Vector3, Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import generatePropulsionParticles from './PropulsionParticles'
import { gameOver,  isGamePlaying } from './Game'

const spaceshipG = new Group()
const spaceShipParams = {
    // Default Spaceship Orbit Parameters:
    spaceshipObj: undefined,
    spaceshipDestroyed: false,
    timeBeforeRespawn: 10,
    spaceshipRespawning: false,
    spaceshipSpeed: 9,
    spaceshipRadius: 6,
    spaceshipEllipticOffset: 1.3,
    spaceshipAmplitudeY: 1.3,
    spaceshipOscilationY: 6,
    dummyPointOffset: 0.1,
    latestSpaceshipPosition: [0,0,0],
    latestSpaceshipDummyPosition: [0,0,0],
    explosionParticles: undefined
}

const cameraParams = {
    // Default Camera Orbit Parameters:
    camera: undefined,
    latestCameraPosition: [0,0,0],
    cameraLookPosition: new Vector3(),
    cameraDummyPoint: new Vector3(),
    cameraDummyPointOffset: 0, 
    cameraToSpaceshipOffset: 0.4,
    cameraRadiusMultiplier: 0.7,
    cameraAmplitudeOffset: 1.2,
}

let propulsionParticlesG
let propulsionParticles

const setupSpaceship = (loadingManager, camera, scene) => {
    cameraParams.camera = camera
    // import gltf model from file
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Spaceship/Spaceship.gltf',
        (gltf) =>
        {
            const model = gltf.scene.children[0]
            model.scale.set(0.015, 0.015, 0.015)
            model.position.set(0,0,0)
            spaceShipParams.spaceshipObj = model
            spaceshipG.add(model)
        }
    )
    /**
     * Spaceship propulsion particle system
     */
    propulsionParticlesG = new Group()
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

const spawnExplosion = (scene) => {
    const explosionParticlesG = new Group()
    spaceShipParams.explosionParticles = new generatePropulsionParticles({
        parent: explosionParticlesG,
        camera: cameraParams.camera,
        size: 100,
        length: 0.3,
        spread: 1/10,
        width: 4,
        speed: 0.005,
        innerColor: 0x007bff,
        outterColor: 0x007bff
    })
    const explosionDuration = 0.2
    // explosionParticlesG.position.set(...spaceShipParams.latestSpaceshipDummyPosition)
    explosionParticlesG.rotation.z = Math.PI/2
    explosionParticlesG.rotation.y = Math.PI/2
    explosionParticlesG.position.z = 1
    spaceshipG.add(explosionParticlesG)
    setTimeout(()=> {
        spaceshipG.remove(explosionParticlesG)
        spaceShipParams.explosionParticles = undefined
    }, explosionDuration*1000)
}

const spaceshipDestroy = async (scene, elapsedTime) => {
    propulsionParticlesG.visible =false
    spaceShipParams.spaceshipObj.visible=false
    spawnExplosion(scene)
    spaceShipParams.spaceshipDestroyed = true
    await gameOver(scene)
}

const spaceshipRespawn = (scene) => {
    // scene.add(spaceshipG)
    propulsionParticlesG.visible = true
    spaceShipParams.spaceshipObj.visible=true
    spaceShipParams.spaceshipRespawning = true
}

let lerpFactor=0
let previousRAF=0
const spaceshipTick = (elapsedTime, camera, controls, freeView) => {
    const deltaTime = (elapsedTime*1000 - previousRAF)
    previousRAF = elapsedTime*1000
    if(propulsionParticles){
        propulsionParticles.Step(deltaTime)
    }
    // Set Spaceship Position
    spaceShipParams.latestSpaceshipPosition = calculateSpaceshipPosition(elapsedTime)
    // if(!spaceShipParams.spaceshipDestroyed){
        spaceshipG.position.set(...spaceShipParams.latestSpaceshipPosition)
    // }
    // Set Spaceship Rotation by making it look at a point that is + dummyPointOffset ahead
    spaceShipParams.latestSpaceshipDummyPosition = calculateSpaceshipPosition(elapsedTime, spaceShipParams.dummyPointOffset)
    const dummyPoint = new THREE.Vector3(...spaceShipParams.latestSpaceshipDummyPosition)
    spaceshipG.lookAt(dummyPoint)

    
    // check if the freeView is enabled before forcing updates to the camera position, useful for dev
    if (!freeView){        
        // Camera Rotation - camera looks at this point (rotation) when following the spaceship
        cameraParams.cameraDummyPoint.set(...calculateSpaceshipPosition(elapsedTime, cameraParams.cameraDummyPointOffset))
        // Camera Position
        if(spaceShipParams.spaceshipRespawning){
            cameraParams.latestCameraPosition = calculateCameraPosition(elapsedTime)
            const lerpStep=0.001
            lerpFactor+=lerpStep*deltaTime
            if(lerpFactor<=1){
                controls.target.lerp(cameraParams.cameraDummyPoint, lerpFactor)
                
                const latestCameraPositionVec3 = new Vector3(...cameraParams.latestCameraPosition)
                const targetPositionVec3 = camera.position.clone().lerp(latestCameraPositionVec3, lerpFactor)
                cameraParams.latestCameraPosition = [targetPositionVec3.x, targetPositionVec3.y, targetPositionVec3.z]
            } 
            else {
                spaceShipParams.spaceshipRespawning = false
                spaceShipParams.spaceshipDestroyed = false
                lerpFactor = 0
                controls.target = cameraParams.cameraDummyPoint
                // camera.position.set(...cameraParams.latestCameraPosition)
            }
        } else if(!spaceShipParams.spaceshipDestroyed || !isGamePlaying()) {
            cameraParams.latestCameraPosition = calculateCameraPosition(elapsedTime)
            controls.target = cameraParams.cameraLookPosition
        } 
        camera.position.set(...cameraParams.latestCameraPosition)
    }

    if(spaceShipParams.explosionParticles){
        spaceShipParams.explosionParticles.Step(deltaTime)
    }
}

export {spaceshipG, setupSpaceship, spaceshipTick, spaceShipParams, cameraParams, calculateSpaceshipPosition, spaceshipDestroy, spaceshipRespawn}
