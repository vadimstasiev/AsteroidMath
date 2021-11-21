import * as THREE from 'three'

const playClicked = (scene, camera) => {
    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

    const asteroid1 = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
    asteroid1.castShadow = true
    asteroid1.scale.set(1, 1, 1)


    // Find coordinates for a random point within the radius of 10 and outside the radius of 6

    const max = 10
    const min = 6
    const amplitudeY = 4
    const random = Math.random() * (max) 
    const x = Math.sin(random) *max - ((Math.random()-0.5)*min)
    const y = (Math.random()-0.5)* amplitudeY
    const z = Math.cos(random) *max - ((Math.random()-0.5)*min)
    asteroid1.position.set(x, y, z)
    
    // d = camera.getworlddirection();
    // diff = target.position - camera.position;
    // theta = atan2(diff.x,diff.z) - atan2(d.x,d.z);
    
    // https://stackoverflow.com/questions/42215829/calculate-target-range-on-circle-three-js
    scene.add(asteroid1)

}

export default playClicked
