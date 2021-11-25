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

const calculateSpaceshipPosition = (elapsedTime) => {
    const x = Math.cos(elapsedTime/spaceShipParams.spaceshipSpeed)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset
    const y = Math.cos(elapsedTime/spaceShipParams.spaceshipOscilationY)*spaceShipParams.spaceshipAmplitudeY
    const z = Math.sin(elapsedTime/spaceShipParams.spaceshipSpeed)*spaceShipParams.spaceshipRadius
    return {x,y,z}
}

const spaceshipTick = (elapsedTime, camera, controls, freeView) => {
    

    const {x,y,z} = calculateSpaceshipPosition(elapsedTime)
    spaceshipG.position.x = x
    spaceshipG.position.y = y
    spaceshipG.position.z = z


    const dummyPoint = new THREE.Vector3()
    dummyPoint.x = Math.cos((elapsedTime/spaceShipParams.spaceshipSpeed)+spaceShipParams.dummyPointOffset)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset
    dummyPoint.y = Math.cos(elapsedTime/spaceShipParams.spaceshipOscilationY + spaceShipParams.dummyPointOffset)*spaceShipParams.spaceshipAmplitudeY
    dummyPoint.z = Math.sin((elapsedTime/spaceShipParams.spaceshipSpeed)+spaceShipParams.dummyPointOffset)*spaceShipParams.spaceshipRadius
    spaceshipG.lookAt(dummyPoint)

    // Animate Camera position to follow spaceship
    if (!freeView){
        const cameraPosition = new THREE.Vector3()  
        // const cameraToSpaceshipOffset = Math.abs(Math.sin(elapsedTime/10))
        const cameraToSpaceshipOffset = 0.3
        const cameraRadiusOffset = 0.7
        const cameraAmplitudeOffset = 1.2
        cameraPosition.x = Math.cos((elapsedTime/spaceShipParams.spaceshipSpeed)+cameraToSpaceshipOffset)*spaceShipParams.spaceshipRadius*spaceShipParams.spaceshipEllipticOffset*cameraRadiusOffset
        cameraPosition.y = Math.cos(elapsedTime/spaceShipParams.spaceshipOscilationY+cameraToSpaceshipOffset)*spaceShipParams.spaceshipAmplitudeY*cameraAmplitudeOffset
        cameraPosition.z = Math.sin((elapsedTime/spaceShipParams.spaceshipSpeed)+cameraToSpaceshipOffset)*spaceShipParams.spaceshipRadius*cameraRadiusOffset
        camera.position.set(cameraPosition.x,cameraPosition.y, cameraPosition.z)
        controls.target = spaceshipG.position
    }
}

export {setupSpaceship, spaceshipTick, spaceShipParams}
