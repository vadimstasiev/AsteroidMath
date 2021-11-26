import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import generatePropulsionParticles from './PropulsionParticles'

const spaceshipG = new THREE.Group()
const spaceShipParams = {
    // Default Spaceship Orbit Parameters:
    spaceshipSpeed: 9,
    spaceshipRadius: 6,
    spaceshipEllipticOffset: 1.3,
    spaceshipAmplitudeY: 1.3,
    spaceshipOscilationY: 6,
    dummyPointOffset: 0.1,
}

const cameraTrajectoryParams = {
    // Default Camera Orbit Parameters:
    cameraToSpaceshipOffset: 0.3,
    cameraRadiusMultiplier: 0.7,
    cameraAmplitudeOffset: 1.2,
}



const setupSpaceship = (loadingManager, camera) => {
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Spaceship/glTF/Spaceship.gltf',
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
    const propulsionParticles = new generatePropulsionParticles({
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

    return {spaceshipG, propulsionParticles}
}

const calculateSpaceshipPosition = (elapsedTime, offset = 0) => {
    const x = Math.cos((elapsedTime+offset)/spaceShipParams.spaceshipSpeed)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset
    const y = Math.cos((elapsedTime+offset)/spaceShipParams.spaceshipOscilationY)*spaceShipParams.spaceshipAmplitudeY
    const z = Math.sin((elapsedTime+offset)/spaceShipParams.spaceshipSpeed)*spaceShipParams.spaceshipRadius
    return [x,y,z]
}

// Animate Camera position to follow a similar trajectory as the spaceship
const calculateCameraPosition = (elapsedTime) => {
    // cameraTrajectoryParams.cameraToSpaceshipOffset = Math.abs(Math.sin(elapsedTime/10))
    const x = Math.cos((elapsedTime/spaceShipParams.spaceshipSpeed)+cameraTrajectoryParams.cameraToSpaceshipOffset)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset*cameraTrajectoryParams.cameraRadiusMultiplier
    const y = Math.cos(elapsedTime/spaceShipParams.spaceshipOscilationY+cameraTrajectoryParams.cameraToSpaceshipOffset)*spaceShipParams.spaceshipAmplitudeY*cameraTrajectoryParams.cameraAmplitudeOffset
    const z = Math.sin((elapsedTime/spaceShipParams.spaceshipSpeed)+cameraTrajectoryParams.cameraToSpaceshipOffset)*spaceShipParams.spaceshipRadius*cameraTrajectoryParams.cameraRadiusMultiplier
    return [x,y,z]
}

const spaceshipTick = (elapsedTime, camera, controls, freeView) => {
    // Set Spaceship Position
    spaceshipG.position.set(...calculateSpaceshipPosition(elapsedTime))
    // Set Spaceship Rotation by making it look at a point that is "+ dummyPointOffset" ahead
    const dummyPoint = new THREE.Vector3(...calculateSpaceshipPosition(elapsedTime, spaceShipParams.dummyPointOffset))
    spaceshipG.lookAt(dummyPoint)

    // check if the freeView is enabled before forcing updates to the camera position, useful for dev
    if (!freeView){
        camera.position.set(...calculateCameraPosition(elapsedTime))
        controls.target = spaceshipG.position
    }
}

export {setupSpaceship, spaceshipTick, spaceShipParams, cameraTrajectoryParams, calculateSpaceshipPosition}
