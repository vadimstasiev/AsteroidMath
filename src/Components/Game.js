import * as THREE from 'three'

const playClicked = (scene) => {
  for (let i = 0; i < 1000; i++) {
        const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
        const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

        const asteroid1 = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
        asteroid1.castShadow = true
        asteroid1.scale.set(1, 1, 1)

        const max = 20
        const min = 6

        const x = (Math.random() * (max - min) + min) * ((Math.random()-0.5)>0?1:-1)
        const y = 0
        const z = (Math.random() * (max - min) + min) * ((Math.random()-0.5)>0?1:-1)
        asteroid1.position.set(x, y, z)
        scene.add(asteroid1)
    }
}

export default playClicked
