import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint, getRandomInt, getRandomArbitrary } from './Helpers'
import { spaceshipG, spaceShipParams, cameraParams, calculateCameraPosition, calculateSpaceshipPosition } from './Spaceship'
import { spawnPointOverlay, removePointOverlay } from './AsteroidOverlay'

const showTrajectories = false

let asteroidArray = []
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

const spawnAsteroid = (elapsedTime, scene, camera, params={}) => {
    const {
        willHit,
        hasOverlay,
        timeBeforeIntersection,
    } = params
    if(asteroidsScene){
        const frustum = new THREE.Frustum()
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))
        
        const center = new Vector3(0, 0, 0)
        
        const maxAsteroidSize = 0.2
        const minAsteroidSize = 0.05
        const spawnAngle = Math.PI/2
        const spawnAngleRange = 0.2
        const maxRadius = 12
        const minRadius = 11.8
        const amplitudeY = 4
        let x,y,z, theta
        const vec3 = new Vector3()


        // Find coordinates for a random point within the radius of 10 and outside the radius of 6
        const asteroidObj = asteroidsScene.children[getRandomInt(0, 8)].clone()
        asteroidObj.castShadow = true
        const randomSize = getRandomArbitrary(minAsteroidSize, maxAsteroidSize)
        asteroidObj.scale.set(randomSize, randomSize, randomSize)
        

        let count = 0
        // maxTries = maxRadius tries to find a random position that fits the requirements bellow
        let maxTries = 200 
        const cameraDirection = new Vector3()

        do {
            const random = Math.random() *maxRadius 
            x = Math.sin(random) *maxRadius - ((Math.random()-0.5)*minRadius)
            y = (Math.random()-0.5)* amplitudeY
            z = Math.cos(random) *maxRadius - ((Math.random()-0.5)*minRadius)
            vec3.set(x,y,z)

            camera.getWorldDirection(cameraDirection)
            const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z)
            const diff = vec3.clone().sub(cameraDirection)
            // theta is the angle between where the camera is looking vs where the object is in relation to the camera.
            theta = Math.atan2(diff.x, diff.z) - cameraAngle

            count++
            // Requirements: Check if position is inside the spawnAngleRange and if the position is outside of the view of the camera
        } while(!( -spawnAngleRange < theta && theta < spawnAngleRange && frustum.containsPoint(vec3)) && count < maxTries )
        if(count!==maxTries){
            asteroidObj.position.set(x, y, z)
            const axisOfRotation = new Vector3(0, 1, 0)
            // rotate the calculated asteroid position around the Y axis from the center of the world position and to the right of the camera
            rotateAboutPoint(asteroidObj, center, axisOfRotation, -spawnAngle)
            scene.add(asteroidObj)

            // how many times longer the asteroid target destination is set to be
            const targetScallarMultiplier = 6
            // total duration of the asteroid course
            const duration = timeBeforeIntersection*targetScallarMultiplier
            const trajectoryGeometry = new THREE.BufferGeometry()
            const trajectoryMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } )
            const trajectoryObj = new THREE.Line( trajectoryGeometry, trajectoryMaterial )
            scene.add(trajectoryObj)
            let maxScalarOffsetMultiplier
            let minScalarOffsetMultiplier
            if(!willHit){    
                // values that guarantee a spaceship miss
                maxScalarOffsetMultiplier = 20
                minScalarOffsetMultiplier = 1.7
            } else {
                // values that guarantee a spaceship hit
                maxScalarOffsetMultiplier = 0.4
                minScalarOffsetMultiplier = 0
                // const spaceshipPositionVec3 = new Vector3(...spaceShipParams.latestSpaceshipPosition);
                // cameraParams.cameraLookPosition = () => (asteroidObj.position.clone()-spaceshipPositionVec3).multiplyScalar(0.5)
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
                timeout: elapsedTime+duration,
                duration, 
                targetScallarMultiplier,
                intersectionScalarOffsetMultiplier,
                hasOverlay
            })
            gsap.to(asteroidObj.rotation,  {
                duration: duration,
                x: "random(-20.0,20.0)",
                y: "random(-20.0,20.0)",
                z: "random(-20.0,20.0)",
            })
            // Add Overlay
            if(hasOverlay){
                spawnPointOverlay(asteroidObj)
            }
        }
    }
}

const asteroidTick = (elapsedTime, scene, controls, freeView) => {
    for (let i in asteroidArray ) {
        const {
            asteroid, 
            spawnPointVec3, 
            trajectoryObj, 
            intersectionPointVec3,
            timeout, 
            duration,
            targetScallarMultiplier,
            intersectionScalarOffsetMultiplier,
            hasOverlay
        } = asteroidArray[i]
        if(elapsedTime<timeout){
            const trajectoryProgress = (duration - timeout + elapsedTime)/duration
            const lerpFactor = trajectoryProgress / (1/targetScallarMultiplier)
            // only update intersectionPointVec3 until it has reached spaceship position
            if(trajectoryProgress <= (1/targetScallarMultiplier)){
                intersectionPointVec3.set(...spaceShipParams.latestSpaceshipPosition)
                // update camera looking direction
                if(hasOverlay && !freeView){
                    const cameraTargetPositionVec3 = asteroid.position.clone().add(intersectionPointVec3).multiplyScalar(0.5)
                    // const lerpedTargetPosition = spaceshipG.position.clone()
                    const lerpedTargetPosition = cameraParams.cameraDummyPoint.clone()
                    console.log(lerpFactor)
                    lerpedTargetPosition.lerp(asteroid.position.clone(), lerpFactor)
                    cameraParams.cameraLookPosition = lerpedTargetPosition
                    // if(lerpFactor=1){
                    //     cameraParams.cameraLookPosition = spaceshipG.position
                    // }
                }
            } else {
                // update camera looking direction
                if(hasOverlay && !freeView){
                    // const lerpedTargetPosition = cameraParams.cameraLookPosition
                    // lerpedTargetPosition.lerp(spaceshipG.position, lerpFactor)
                    // cameraParams.cameraLookPosition = lerpedTargetPosition
                    cameraParams.cameraLookPosition = cameraParams.cameraDummyPoint
                }
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
            if(hasOverlay){
                removePointOverlay(asteroid)
            }
            scene.remove(trajectoryObj)
            asteroidArray.splice(i, 1)
        }
    }
}




export {setupAsteroids, spawnAsteroid, asteroidTick}
