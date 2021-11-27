import * as THREE from 'three'
import gsap from 'gsap'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams } from './Spaceship'


const asteroidArray = []

const showTrajectories = false

const spawnAsteroid = (elapsedTime, scene, camera, willHit = false) => {
    const durationUntilCollision = 10

    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })


    const frustum = new THREE.Frustum()
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

    const center = new Vector3(0, 0, 0)

    const maxAsteroidSize = 0.1
    const minAsteroidSize = 0.04
    // const maxAsteroidSize = 1
    // const minAsteroidSize = 0.2
    const spawnAngle = Math.PI/2
    const spawnAngleRange = 0.3
    const max = 8
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

            const duration = durationUntilCollision/2
            const geometry = new THREE.BufferGeometry()
            const material = new THREE.LineBasicMaterial( { color : 0xff0000 } )
            const curveObject = new THREE.Line( geometry, material )
            scene.add(curveObject)
            let intersectionScalarOffsetMultiplier = 1
            if(!willHit){    
                const maxScalarOffsetMultiplier = 2
                const minScalarOffsetMultiplier = 1.7
                intersectionScalarOffsetMultiplier = (Math.random()<0.5?1:-1)*(Math.random()*(maxScalarOffsetMultiplier-minScalarOffsetMultiplier)+minScalarOffsetMultiplier)
                console.log(intersectionScalarOffsetMultiplier)
            } 
            const spawnPointVec3 = asteroidObj.position.clone()
            asteroidArray.push({
                asteroid: asteroidObj, 
                spawnPointVec3,
                curveObject ,
                deathTime: elapsedTime+duration,
                duration, 
                intersectionScalarOffsetMultiplier
            })
        }
    // }
}

const asteroidTick = (deltaTime, elapsedTime, scene) => {
    for (let i in asteroidArray ) {
        const {
            asteroid, 
            spawnPointVec3, 
            curveObject, 
            deathTime, 
            duration,
            intersectionScalarOffsetMultiplier
        } = asteroidArray[i]
        if(elapsedTime<deathTime){
            const intersectionPointVec3 = new Vector3(...spaceShipParams.latestSpaceshipPosition)
            // calculate vector of the position twice the distance away from intersectionPointVec3 to spawnPointVec3 
            const targetPointVec3 = intersectionPointVec3.clone()
                .sub(spawnPointVec3)
                .multiplyScalar(2)
                .add(spawnPointVec3)
            
            // intersectionPointVec3
            const up = new Vector3(0, 10, 0)
            // up must be bigger
            const parallelVec3 = new Vector3(intersectionPointVec3.y, intersectionPointVec3.x).add(up).normalize().multiplyScalar(intersectionScalarOffsetMultiplier).add(intersectionPointVec3)
            var curve = new THREE.CurvePath()
            console.log(intersectionPointVec3.y)
            curve.add(
                new THREE.QuadraticBezierCurve3(
                // new THREE.LineCurve3(
                    spawnPointVec3,
                    intersectionScalarOffsetMultiplier===1?intersectionPointVec3:parallelVec3,
                    targetPointVec3,
                )
            )
            if(showTrajectories){
                const points = curve.getPoints( 50 );
                curveObject.geometry.setFromPoints(points)
            }
            
            let trajectoryProgress = (duration - deathTime + elapsedTime)/duration
            const newPosition = curve.getPoint(trajectoryProgress)
            asteroid.position.copy(newPosition)
        } else {
            scene.remove(asteroid)
            scene.remove(curveObject)
            asteroidArray.splice(i, 1)
        }
    }
}


const playClicked = (elapsedTime, scene, camera) => {
    const willHit = true
    spawnAsteroid(elapsedTime, scene, camera, willHit)
    spawnAsteroid(elapsedTime, scene, camera)
    spawnAsteroid(elapsedTime, scene, camera)
    spawnAsteroid(elapsedTime, scene, camera)
    spawnAsteroid(elapsedTime, scene, camera)
}

export {playClicked, asteroidTick}
