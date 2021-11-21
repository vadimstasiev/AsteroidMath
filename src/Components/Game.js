import * as THREE from 'three'

const playClicked = (scene) => {
    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

    const asteroid1 = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
    asteroid1.castShadow = true
    asteroid1.scale.set(1, 1, 1)


    // Find coordinates for a random point within the radius of 10 and outside the radius of 6

    const max = 10
    const min = 6
    const random = Math.random() * (max) 
    const x = Math.sin(random) *max - ((Math.random()-0.5)*min)
    const y = 0
    const z = Math.cos(random) *max - ((Math.random()-0.5)*min)
    asteroid1.position.set(x, y, z)
    scene.add(asteroid1)

}

export default playClicked
