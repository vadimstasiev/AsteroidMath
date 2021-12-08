import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint, getRandomInt, getRandomArbitrary, getterSetter } from './Helpers'
import { spaceshipProps, cameraProps, spaceshipDestroy } from './Spaceship'
import { spawnPointOverlay, removePointOverlay } from './AsteroidOverlay'
import { getIsGamePlaying } from './Game'

const dev_showTrajectories = false

let asteroidArray = []
let asteroidsScene = null

// the asteroid will fully clip through the ship if set to 100% (1), this makes the impact "trigger" earlier to give a better illusion of physics
const intersectionTrajectoryPercentageToPhysicalHit = 0.96

const [getLiveTimeBeforeCollision, setLiveTimeBeforeCollision] = getterSetter(0)

const setupAsteroids = (loadingManager) => {
    // import gltf model from file
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Asteroids/Asteroids.gltf',
        (gltf) =>
        {
            asteroidsScene = gltf.scene
        }
    )
}

const spawnAsteroid = async (elapsedTime, scene, camera, params={}) => {
    const {
        willHit,
        maxRandomOffsetMiss,
        hasOverlay,
        timeBeforeIntersection,
        cameraWillFollow,
        spawnNumber
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


        const asteroidObj = asteroidsScene.children[getRandomInt(0, 8)].clone()
        const randomSize = getRandomArbitrary(minAsteroidSize, maxAsteroidSize)
        asteroidObj.scale.set(randomSize, randomSize, randomSize)
        

        let count = 0
        // maxTries: tries to find a random position that fits the requirements bellow
        let maxTries = 200 
        const cameraDirection = new Vector3()

        // Find coordinates for a random point within the radius of 10 and outside the radius of 6
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
            // rotate the calculated asteroid position on the Y axis around the center of the world and to the right of the camera
            rotateAboutPoint(asteroidObj, center, axisOfRotation, -spawnAngle)
            scene.add(asteroidObj)

            // how many times the distance from the asteroid spawn point to the intersection point
            const targetScallarMultiplier = 6
            // total duration of the asteroid trajectory course
            let duration = timeBeforeIntersection*targetScallarMultiplier
            // account the early impact adjustment 
            duration = duration + duration*(1-intersectionTrajectoryPercentageToPhysicalHit)
            
            let trajectoryObj
            // show trajectories of asteroids (for dev and troubleshooting)
            if(dev_showTrajectories) {
                const trajectoryGeometry = new THREE.BufferGeometry()
                const trajectoryMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } )
                trajectoryObj = new THREE.Line( trajectoryGeometry, trajectoryMaterial )
                scene.add(trajectoryObj)
            }

            let maxScalarOffsetMultiplier
            let minScalarOffsetMultiplier
            if(!willHit){    
                // values that guarantee a spaceship miss
                maxScalarOffsetMultiplier = maxRandomOffsetMiss || 20
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
                timeout: elapsedTime+duration,
                duration, 
                targetScallarMultiplier,
                intersectionScalarOffsetMultiplier,
                hasOverlay,
                willHit,
                cameraWillFollow
            })
            gsap.to(asteroidObj.rotation,  {
                duration: duration,
                x: "random(-20.0,20.0)",
                y: "random(-20.0,20.0)",
                z: "random(-20.0,20.0)",
            })
            // Add Overlay
            if(hasOverlay){
                spawnPointOverlay(asteroidObj, spawnNumber || "not_set")
            }
        }
    }
}

const removeAsteroid = (scene, asteroid, index, hasOverlay, trajectoryObj) => {
    scene.remove(asteroid)
    if(hasOverlay){
        removePointOverlay(asteroid)
    }
    if(dev_showTrajectories){
        scene.remove(trajectoryObj)
    }
    asteroidArray.splice(index, 1)
}

const asteroidTick = (elapsedTime, scene, dev_freeView) => {
    let cameraAlreadyFollowingSomething = false
    // reverse iteration for convinience of cameraAlreadyFollowingSomething, makes it easier to get the lastest (specific) asteroid that needs following 
    for (let i = asteroidArray.length - 1; i >= 0; i--) {
        const {
            asteroid, 
            spawnPointVec3, 
            trajectoryObj, 
            intersectionPointVec3,
            timeout, 
            duration,
            targetScallarMultiplier,
            intersectionScalarOffsetMultiplier,
            hasOverlay,
            willHit,
            cameraWillFollow
        } = asteroidArray[i]
        const gameIsPlaying =  getIsGamePlaying()
        if(elapsedTime<timeout){
            const trajectoryProgress = (duration - timeout + elapsedTime)/duration
            // the intersection timing is the same regardless of hit or miss 
            // intersection with spaceship happens at 1/targetScallarMultiplier of the curve (which is targetScallarMultiplier times bigger than 1/targetScallarMultiplier)
            const progressToIntersection = 1/targetScallarMultiplier
            // lerpFactor [ 0 ; 1 ]
            const lerpFactor = trajectoryProgress / progressToIntersection
            // Camera Rotation to follow a given asteroid
            if(!dev_freeView && !cameraAlreadyFollowingSomething && cameraWillFollow && !spaceshipProps.spaceshipDestroyed){
                cameraAlreadyFollowingSomething = true
                // update camera looking direction
                if(trajectoryProgress <= progressToIntersection){
                    cameraProps.cameraLookPosition = cameraProps.cameraLookPosition.clone()
                        .lerp(asteroid.position.clone()
                            .add(intersectionPointVec3)
                            .multiplyScalar(0.5),
                            lerpFactor
                        )
                } else {
                    // progressToIntersection < trajectoryProgress < 2*progressToIntersection
                    if(trajectoryProgress>progressToIntersection && trajectoryProgress<(2*progressToIntersection)){
                        cameraProps.cameraLookPosition = cameraProps.cameraLookPosition.clone().lerp(cameraProps.cameraDummyPoint, (trajectoryProgress/(progressToIntersection)-1))
                    } else {
                        cameraProps.cameraLookPosition = cameraProps.cameraDummyPoint
                    }
                }
            } 
            // only update intersectionPointVec3 until asteroid has reached/passed spaceship position
            if(trajectoryProgress <= progressToIntersection){
                intersectionPointVec3.set(...spaceshipProps.latestSpaceshipPosition)
            }
            // calculate vector of the position that is targetScallarMultiplier times away in a straight line from intersectionPointVec3 to spawnPointVec3
            const targetPointVec3 = intersectionPointVec3.clone()
                .sub(spawnPointVec3)
                .multiplyScalar(targetScallarMultiplier)
                .add(spawnPointVec3)
            // up must be a vector greater than intersectionPointVec3 (up > intersectionPointVec3)
            const up = new Vector3(0, 10, 0)
            // up is added because as the ship goes above and bellow y=0 , it changes the direction of the vector, so we add a vector "up" to offset it 
            const parallelVec3 = new Vector3(intersectionPointVec3.y, intersectionPointVec3.x)
                .add(up)
                .normalize()
                .multiplyScalar(intersectionScalarOffsetMultiplier)
                .add(intersectionPointVec3)
            var curve = new THREE.CurvePath()
            curve.add(
                new THREE.QuadraticBezierCurve3(
                    spawnPointVec3,
                    parallelVec3,
                    targetPointVec3,
                )
            )
            if(dev_showTrajectories){
                const points = curve.getPoints(50);
                trajectoryObj.geometry.setFromPoints(points)
            }
            const newPosition = curve.getPoint(trajectoryProgress)
            asteroid.position.copy(newPosition)
            // update time for impact
            if(willHit && gameIsPlaying){
                const liveTimeBeforeIntersection =  Math.floor(duration/targetScallarMultiplier - (trajectoryProgress / progressToIntersection)*(duration/targetScallarMultiplier))
                setLiveTimeBeforeCollision(liveTimeBeforeIntersection)
            } else if(!gameIsPlaying){
                setLiveTimeBeforeCollision(0)
            }

            // asteroid hits the ship
            if((trajectoryProgress > progressToIntersection*intersectionTrajectoryPercentageToPhysicalHit) && willHit && gameIsPlaying){
                removeAsteroid(scene, asteroid, i, hasOverlay, trajectoryObj)
                spaceshipDestroy(scene, elapsedTime)
                // TODO !! only remove in that certain condition after playing again 
            } else if (willHit && !gameIsPlaying) {
                removeAsteroid(scene, asteroid, i, hasOverlay, trajectoryObj)
            }
            
        } else {
            removeAsteroid(scene, asteroid, i, hasOverlay, trajectoryObj)
        }
    }
}




export {setupAsteroids, spawnAsteroid, asteroidTick, getLiveTimeBeforeCollision}
