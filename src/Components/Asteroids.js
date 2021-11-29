import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint, getRandomInt, getRandomArbitrary } from './Helpers'
import { spaceShipParams } from './Spaceship'

const showTrajectories = false

const asteroidArray = []
let asteroidsScene = null

const setupAsteroids = (loadingManager) => {
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Asteroids/Asteroids.gltf',
        (gltf) =>
        {
            asteroidsScene = gltf.scene
        }
    )
}

const spawnAsteroid = (elapsedTime, scene, camera, willHit = false) => {
    if(asteroidsScene){
        const durationUntilCollision = 2
        const frustum = new THREE.Frustum()
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

        const center = new Vector3(0, 0, 0)

        const maxAsteroidSize = 0.2
        const minAsteroidSize = 0.05
        const spawnAngle = Math.PI/2
        const spawnAngleRange = 0.5
        const max = 8
        const min = 6
        const amplitudeY = 4
        let x,y,z, theta
        const vec3 = new Vector3()


        // Find coordinates for a random point within the radius of 10 and outside the radius of 6
        const asteroidObj = asteroidsScene.children[getRandomInt(0, 8)].clone()
        asteroidObj.castShadow = true
        const randomSize = getRandomArbitrary(minAsteroidSize, maxAsteroidSize)
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

            // how many times longer the asteroid target destination is set to be
            const targetScallarMultiplier = 6
            // total duration of the asteroid course
            const duration = durationUntilCollision*targetScallarMultiplier
            const trajectoryGeometry = new THREE.BufferGeometry()
            const trajectoryMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } )
            const trajectoryObj = new THREE.Line( trajectoryGeometry, trajectoryMaterial )
            scene.add(trajectoryObj)
            let maxScalarOffsetMultiplier
            let minScalarOffsetMultiplier
            if(!willHit){    
                // values that guarantee a spaceship miss
                maxScalarOffsetMultiplier = 20 // maybe make this a param?
                minScalarOffsetMultiplier = 1.7
            } else {
                // values that guarantee a spaceship hit
                maxScalarOffsetMultiplier = 0.4
                minScalarOffsetMultiplier = 0
            }
            // spawning position of the asteroid
            const spawnPointVec3 = asteroidObj.position.clone()
            // position parallel offset from the spaceship, the bigger the value the bigger the trajectory arc around the ship 
            const intersectionScalarOffsetMultiplier = (Math.random()<0.5?1:-1)*getRandomArbitrary(minScalarOffsetMultiplier, maxScalarOffsetMultiplier)
            asteroidArray.push({
                asteroid: asteroidObj, 
                spawnPointVec3,
                intersectionPointVec3: new Vector3(),
                trajectoryObj,
                deathTime: elapsedTime+duration,
                duration, 
                targetScallarMultiplier,
                intersectionScalarOffsetMultiplier
            })
            gsap.to(asteroidObj.rotation,  {
                duration: duration,
                x: "random(-20.0,20.0)",
                y: "random(-20.0,20.0)",
                z: "random(-20.0,20.0)",
            })
        }
    }
}

const asteroidTick = (elapsedTime, scene) => {
    for (let i in asteroidArray ) {
        const {
            asteroid, 
            spawnPointVec3, 
            trajectoryObj, 
            intersectionPointVec3,
            deathTime, 
            duration,
            targetScallarMultiplier,
            intersectionScalarOffsetMultiplier
        } = asteroidArray[i]
        if(elapsedTime<deathTime){
            const trajectoryProgress = (duration - deathTime + elapsedTime)/duration
            // only update intersectionPointVec3 until it has reached spaceship position
            if(trajectoryProgress < (1/targetScallarMultiplier)){
                intersectionPointVec3.set(...spaceShipParams.latestSpaceshipPosition)
            }
            // calculate vector of the position twice the distance away from intersectionPointVec3 to spawnPointVec3 
            const targetPointVec3 = intersectionPointVec3.clone()
                .sub(spawnPointVec3)
                .multiplyScalar(targetScallarMultiplier)
                .add(spawnPointVec3)
            // up must be a vector greater than intersectionPointVec3 (up > intersectionPointVec3)
            const up = new Vector3(0, 10, 0)
            const parallelVec3 = new Vector3(intersectionPointVec3.y, intersectionPointVec3.x)
                .add(up)
                .normalize()
                .multiplyScalar(intersectionScalarOffsetMultiplier)
                .add(intersectionPointVec3)
            var curve = new THREE.CurvePath()
            curve.add(
                new THREE.QuadraticBezierCurve3(
                // new THREE.LineCurve3(
                    spawnPointVec3,
                    parallelVec3,
                    targetPointVec3,
                )
            )
            if(showTrajectories){
                const points = curve.getPoints(50);
                trajectoryObj.geometry.setFromPoints(points)
            }
            const newPosition = curve.getPoint(trajectoryProgress)
            asteroid.position.copy(newPosition)
        } else {
            scene.remove(asteroid)
            scene.remove(trajectoryObj)
            asteroidArray.splice(i, 1)
        }
    }
}




export {setupAsteroids, spawnAsteroid, asteroidTick}
