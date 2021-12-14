import * as THREE from 'three'
import { Vector3, Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { sleep } from './Helpers'
import { gameOver,  getIsGamePlaying } from './Game'
import generatePropulsionParticles from './PropulsionParticles'

const spaceshipG = new Group()
const spaceshipProps = {
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

const cameraProps = {
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
    cameraProps.camera = camera
    // import gltf model from file
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Spaceship/Spaceship.gltf',
        (gltf) =>
        {
            const model = gltf.scene.children[0]
            model.scale.set(0.015, 0.015, 0.015)
            model.position.set(0,0,0)
            spaceshipProps.spaceshipObj = model
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
    cameraProps.cameraLookPosition = cameraProps.cameraDummyPoint
}

const calculateSpaceshipPosition = (elapsedTime, offset = 0) => {
    const x = Math.cos((elapsedTime+offset)/spaceshipProps.spaceshipSpeed)*spaceshipProps.spaceshipRadius*spaceshipProps.spaceshipEllipticOffset
    const y = Math.cos((elapsedTime+offset)/spaceshipProps.spaceshipOscilationY)*spaceshipProps.spaceshipAmplitudeY
    const z = Math.sin((elapsedTime+offset)/spaceshipProps.spaceshipSpeed)*spaceshipProps.spaceshipRadius
    return [x,y,z]
}

// Animate Camera position to follow a similar trajectory as the spaceship
const calculateCameraPosition = (elapsedTime) => {
    cameraProps.cameraToSpaceshipOffset = Math.abs(Math.sin(elapsedTime/10))/2
    const x = Math.cos((elapsedTime/spaceshipProps.spaceshipSpeed)+cameraProps.cameraToSpaceshipOffset)*spaceshipProps.spaceshipRadius*spaceshipProps.spaceshipEllipticOffset*cameraProps.cameraRadiusMultiplier
    const y = Math.cos(elapsedTime/spaceshipProps.spaceshipOscilationY+cameraProps.cameraToSpaceshipOffset)*spaceshipProps.spaceshipAmplitudeY*cameraProps.cameraAmplitudeOffset
    const z = Math.sin((elapsedTime/spaceshipProps.spaceshipSpeed)+cameraProps.cameraToSpaceshipOffset)*spaceshipProps.spaceshipRadius*cameraProps.cameraRadiusMultiplier
    return [x,y,z]
}

const spawnExplosion = (scene) => {
    const explosionParticlesG = new Group()
    spaceshipProps.explosionParticles = new generatePropulsionParticles({
        parent: explosionParticlesG,
        camera: cameraProps.camera,
        size: 100,
        length: 0.3,
        spread: 1/10,
        width: 4,
        speed: 0.005,
        innerColor: 0x007bff,
        outterColor: 0x007bff
    })
    const explosionDuration = 0.2
    explosionParticlesG.rotation.z = Math.PI/2
    explosionParticlesG.rotation.y = Math.PI/2
    explosionParticlesG.position.z = 1
    spaceshipG.add(explosionParticlesG)
    setTimeout(()=> {
        spaceshipG.remove(explosionParticlesG)
        spaceshipProps.explosionParticles = undefined
    }, explosionDuration*1000)
}

const spaceshipDestroy = async (scene, elapsedTime) => {
    propulsionParticlesG.visible =false
    spaceshipProps.spaceshipObj.visible=false
    spawnExplosion(scene)
    spaceshipProps.spaceshipDestroyed = true
    await gameOver(scene)
}

const spaceshipRespawn = async (scene, timeBeforeRespawn=0) => {
    await sleep(timeBeforeRespawn)
    propulsionParticlesG.visible = true
    spaceshipProps.spaceshipDestroyed = false
    spaceshipProps.spaceshipObj.visible=true
    spaceshipProps.spaceshipRespawning = true
    cameraProps.cameraLookPosition = cameraProps.cameraDummyPoint
}

let lerpFactor=0
let previousRAF=0
const spaceshipTick = (elapsedTime, camera, controls, dev_freeView) => {
    const deltaTime = (elapsedTime*1000 - previousRAF)
    previousRAF = elapsedTime*1000
    if(propulsionParticles){
        propulsionParticles.Step(deltaTime)
    }
    // Set Spaceship Position
    spaceshipProps.latestSpaceshipPosition = calculateSpaceshipPosition(elapsedTime)
    spaceshipG.position.set(...spaceshipProps.latestSpaceshipPosition)
    // Set Spaceship Rotation by making it look at a point that is + dummyPointOffset ahead
    spaceshipProps.latestSpaceshipDummyPosition = calculateSpaceshipPosition(elapsedTime, spaceshipProps.dummyPointOffset)
    const dummyPoint = new THREE.Vector3(...spaceshipProps.latestSpaceshipDummyPosition)
    spaceshipG.lookAt(dummyPoint)

    
    // check if the dev_freeView is enabled before forcing updates to the camera position, useful for dev
    if (!dev_freeView){        
        // Camera Rotation - camera looks at this point when following the spaceship
        cameraProps.cameraDummyPoint.set(...calculateSpaceshipPosition(elapsedTime, cameraProps.cameraDummyPointOffset))
        // Camera Position
        if(spaceshipProps.spaceshipRespawning){
            cameraProps.latestCameraPosition = calculateCameraPosition(elapsedTime)
            const lerpStep=0.001
            lerpFactor+=lerpStep*deltaTime
            if(lerpFactor<=1){
                controls.target.lerp(cameraProps.cameraDummyPoint, lerpFactor)
                
                const latestCameraPositionVec3 = new Vector3(...cameraProps.latestCameraPosition)
                const targetPositionVec3 = camera.position.clone().lerp(latestCameraPositionVec3, lerpFactor)
                cameraProps.latestCameraPosition = [targetPositionVec3.x, targetPositionVec3.y, targetPositionVec3.z]
            } 
            else {
                spaceshipProps.spaceshipRespawning = false
                spaceshipProps.spaceshipDestroyed = false
                lerpFactor = 0
                controls.target = cameraProps.cameraDummyPoint
            }
        } else if(!spaceshipProps.spaceshipDestroyed || !getIsGamePlaying()) {
            cameraProps.latestCameraPosition = calculateCameraPosition(elapsedTime)
            controls.target = cameraProps.cameraLookPosition
        }
        // if(!windowHasFocus){
        //     controls.target = cameraProps.cameraDummyPoint
        // }
        camera.position.set(...cameraProps.latestCameraPosition)
    }

    if(spaceshipProps.explosionParticles){
        spaceshipProps.explosionParticles.Step(deltaTime)
    }
}

export {spaceshipG, setupSpaceship, spaceshipTick, spaceshipProps, cameraProps, calculateSpaceshipPosition, spaceshipDestroy, spaceshipRespawn}
