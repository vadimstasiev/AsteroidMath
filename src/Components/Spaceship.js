import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import generatePropulsionParticles from './PropulsionParticles'

const importSpaceshipModel = (loadingManager, camera) => {
    const gltfLoader = new GLTFLoader(loadingManager)
    const spaceshipG = new THREE.Group()
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
        speed: 0.005
    })

    propulsionParticlesG.rotation.z = Math.PI/2
    propulsionParticlesG.rotation.y = Math.PI/2
    propulsionParticlesG.position.set(0.0,0.02,-0.5)


    spaceshipG.position.set(8,0,0)

    return {spaceshipG, propulsionParticles}
}

export default importSpaceshipModel
