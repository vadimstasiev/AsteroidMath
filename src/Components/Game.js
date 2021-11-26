import * as THREE from 'three'
import gsap from 'gsap'
import { Vector2, Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { calculateSpaceshipPosition } from './Spaceship'


const spawnAsteroid = (elapsedTime, scene, camera) => {
    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })


    const frustum = new THREE.Frustum()
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

    const center = new Vector3(0, 0, 0)

    const maxAsteroidSize = 0.3
    const minAsteroidSize = 0.05
    const spawnAngle = 0.3
    const max = 10
    const min = 6
    const amplitudeY = 4
    let x,y,z, theta
    const vec3 = new Vector3()
    const cameraDirection = camera.getWorldDirection()
    const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z)

    // Find coordinates for a random point within the radius of 10 and outside the radius of 6
    // for (let i = 0; i < 1000; i++) {
        const asteroidObj = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
        asteroidObj.castShadow = true
        const randomSize = Math.random() * (maxAsteroidSize - minAsteroidSize) + minAsteroidSize
        asteroidObj.scale.set(randomSize, randomSize, randomSize)


        let count = 0
        // max tries to find a random position that fits the requirements bellow
        let countMax = 200 

        do {
            const random = Math.random() *max 
            x = Math.sin(random) *max - ((Math.random()-0.5)*min)
            y = (Math.random()-0.5)* amplitudeY
            z = Math.cos(random) *max - ((Math.random()-0.5)*min)
            vec3.set(x,y,z)
            const diff = vec3.clone().sub(cameraDirection)
            // theta is the angle between where the camera is looking vs where the object is in relation to the camera.
            theta = Math.atan2(diff.x, diff.z) - cameraAngle

            count++
            // Check if position is inside the spawnAngle and if the position is outside of the view of the camera
        } while(!( -spawnAngle < theta && theta < spawnAngle && frustum.containsPoint(vec3)) && count < countMax )
        if(count!==countMax){
            asteroidObj.position.set(x, y, z)
            const axisOfRotation = new Vector3(0, 1, 0)
            // rotate the existing around the center of the world position to the right of the camera
            rotateAboutPoint(asteroidObj, center, axisOfRotation, -Math.PI/3)
            scene.add(asteroidObj)
            const [xP, yP, zP] = calculateSpaceshipPosition(elapsedTime)
            gsap.to(asteroidObj.position, { duration: 10, x: xP, y: yP, z: zP })
        }
    // }
}

const playClicked = (elapsedTime, scene, camera, spaceshipG) => {
    
    spawnAsteroid(elapsedTime, scene, camera)
}

export default playClicked
