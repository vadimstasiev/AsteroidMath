import * as THREE from 'three'
import gsap from 'gsap'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { calculateSpaceshipPosition } from './Spaceship'


const asteroidObjArray = []

const spawnAsteroid = (elapsedTime, scene, camera, offsetFromTarget = 0) => {
    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })


    const frustum = new THREE.Frustum()
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

    const center = new Vector3(0, 0, 0)

    // const maxAsteroidSize = 0.1
    // const minAsteroidSize = 0.04
    const maxAsteroidSize = 1
    const minAsteroidSize = 0.2
    const spawnAngle = Math.PI/3
    const spawnAngleRange = 0.3
    const max = 10
    const min = 6
    const amplitudeY = 4
    let x,y,z, theta
    const vec3 = new Vector3()


    // Find coordinates for a random point within the radius of 10 and outside the radius of 6
    // for (let i = 0; i < 1000; i++) {
        const asteroidObj = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
        asteroidObj.castShadow = true
        const randomSize = Math.random() * (maxAsteroidSize - minAsteroidSize) + minAsteroidSize
        asteroidObj.scale.set(randomSize, randomSize, randomSize)
        

        let count = 0
        // max tries to find a random position that fits the requirements bellow
        let countMax = 200 
        const cameraDirection = new Vector3()

        do {
            const random = Math.random() *max 
            x = Math.sin(random) *max - ((Math.random()-0.5)*min)
            y = (Math.random()-0.5)* amplitudeY
            z = Math.cos(random) *max - ((Math.random()-0.5)*min)
            vec3.set(x,y,z)

            camera.getWorldDirection(cameraDirection)
            const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z)
            const diff = vec3.clone().sub(cameraDirection)
            // theta is the angle between where the camera is looking vs where the object is in relation to the camera.
            theta = Math.atan2(diff.x, diff.z) - cameraAngle

            count++
            // Check if position is inside the spawnAngleRange and if the position is outside of the view of the camera
        } while(!( -spawnAngleRange < theta && theta < spawnAngleRange && frustum.containsPoint(vec3)) && count < countMax )
        if(count!==countMax){
            asteroidObj.position.set(x, y, z)
            const axisOfRotation = new Vector3(0, 1, 0)
            // rotate the calculated asteroid position around the center of the world position to the right of the camera
            rotateAboutPoint(asteroidObj, center, axisOfRotation, -spawnAngle)
            scene.add(asteroidObj)
            // const [xP, yP, zP] = calculateSpaceshipPosition(elapsedTime, 9)
            // gsap.to(asteroidObj.position, { duration: 10, x: xP, y: yP, z: zP })
            asteroidObjArray.push({obj: asteroidObj, offsetFromTarget})
        }
    // }
}

// source: https://stackoverflow.com/questions/47733935/threejs-move-object-from-point-a-to-point-b
// linear interpolation function
const lerp = (a, b, t) => { return a + (b - a) * t }
// easing function
function ease(t) { return Math.abs(-1+(4-2*t)*t)}

const asteroidTick = (deltaTime, elapsedTime) => {
    const duration = 2
    let t = deltaTime / duration
    for (let i in asteroidObjArray ) {
        const asteroid = asteroidObjArray[i].obj
        const asteroidPvec3 = asteroid.position.clone()
        const offsetFromTarget = asteroidObjArray[i].offsetFromTarget
        // const [x,y,z] = asteroidObjArray[i].target
        const targetVec3 = new Vector3(...calculateSpaceshipPosition(elapsedTime, duration))
        asteroid.position.x = lerp(targetVec3.x, asteroidPvec3.x, ease(t))
        asteroid.position.y = lerp(targetVec3.y, asteroidPvec3.y, ease(t))
        asteroid.position.z = lerp(targetVec3.z, asteroidPvec3.z, ease(t))
        // console.log("before", asteroid.position)
        // targetVec3.lerp(asteroid.position, 0.99)
        // targetVec3.add(asteroid.position).normalize()
        // console.log( 0.4)
        // asteroid.position.set(targetVec3.x,targetVec3.y,targetVec3.z)
        // console.log("after", asteroid.position)
    }
}


const playClicked = (elapsedTime, scene, camera, spaceshipG) => {
    spawnAsteroid(elapsedTime, scene, camera)
}

export {playClicked, asteroidTick}
