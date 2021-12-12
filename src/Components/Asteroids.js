import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3, Vector2, Group } from 'three'
import { rotateAboutPoint, getRandomInt, getRandomArbitrary, getterSetter } from './Helpers'
import { spaceshipProps, cameraProps, spaceshipDestroy } from './Spaceship'
import { spawnPointOverlay, removePointOverlay } from './AsteroidOverlay'
import { getIsGamePlaying } from './Game'
import generatePropulsionParticles from './PropulsionParticles'

const dev_showTrajectories = false
const dev_showPlane = false


const planeGeometry = new THREE.PlaneGeometry( 3, 3 )
const planeMaterial = new THREE.MeshBasicMaterial();

let asteroidArray = []
let asteroidsScene = null

let explosionsArray = []

/**
 * Mouse
 */
const mouse = new THREE.Vector2()
let currentIntersect = null
const mouseRaycaster = new THREE.Raycaster()
let asteroidArrayClickable = []

// make it globally accessible so it can be accessed by functions in the html
window.asteroidArrayClickable = asteroidArrayClickable
window.markAsteroidClicked = (clickablePlaneIndex) => {
    asteroidArrayClickable[clickablePlaneIndex].wasClicked = true
}

// the asteroidG will fully clip through the ship if set to 100% (1), this makes the impact "trigger" earlier to give a better illusion of physics
const intersectionTrajectoryPercentageToPhysicalHit = 0.96

const [getLiveTimeBeforeCollision, setLiveTimeBeforeCollision] = getterSetter(0)

const setupAsteroids = (loadingManager, sizes) => {
    // import gltf model from file
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.load(
        '/models/Asteroids/Asteroids.gltf',
        (gltf) =>
        {
            asteroidsScene = gltf.scene
        }
    )

    /**
     * Mouse
     */

    window.document.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX / window.innerWidth * 2 - 1
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
    })
    
    window.addEventListener('pointerdown', () =>
    {
        const setWasClicked = (timeout=0) => {
            setTimeout(()=>{
                if(currentIntersect)
                {
                    currentIntersect.object.wasClicked = true
                }
            }, timeout)
            
        }
        setWasClicked()
        for (let i = 0; i < 4; i++) {
            // setClicked multiple times to ensure no clicks are missed
            setWasClicked(10)
        }
    })

}

const spawnExplosion = (asteroidG) => {
    const particlesG = new Group()
    const particles = new generatePropulsionParticles({
        parent: particlesG,
        camera: cameraProps.camera,
        size: 100,
        length: 0.3,
        spread: 1/10,
        width: 1.4,
        speed: 0.005,
        innerColor: 0x42ff03,
        outterColor: 0x42ff03
    })
    const explosionDuration = 0.2
    particlesG.rotation.z = Math.PI/2
    particlesG.rotation.y = Math.PI/2
    particlesG.position.z = 1
    asteroidG.add(particlesG)
    explosionsArray.push(particles)
    setTimeout(()=> {
        asteroidG.remove(particlesG)
        explosionsArray = explosionsArray.filter(particlesE => particlesE!==particles)
    }, explosionDuration*1000)
}

let previousRAF=0
const explosionsTick = (elapsedTime) => {
    const deltaTime = (elapsedTime*1000 - previousRAF)
    previousRAF = elapsedTime*1000
    for (const explosion of explosionsArray) {
        explosion.Step(deltaTime)
    }
}

const spawnAsteroid = async (elapsedTime, scene, camera, params={}) => {
    const {
        willHit,
        maxRandomOffsetMiss,
        hasOverlay,
        timeBeforeIntersection,
        onlyForCameraToFollow,
        spawnNumber,
        maxSpawnRange,
        minSpawnRange,
        maxAmplitudeYRange
    } = params
    if(asteroidsScene){
        const frustum = new THREE.Frustum()
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))
        
        const center = new Vector3(0, 0, 0)
        
        const maxAsteroidSize = 0.3
        const minAsteroidSize = 0.15
        const spawnAngle = Math.PI/2
        const spawnAngleRange = 0.2
        const maxSpawnRangeL = maxSpawnRange || 12
        const minSpawnRangeL = minSpawnRange || 11.8
        const maxAmplitudeYRangeL = maxAmplitudeYRange || 4
        let x,y,z, theta = 0
        const vec3 = new Vector3()

        // how many times the distance from the asteroidG spawn point to the intersection point
        let targetScallarMultiplier = 6

        if(onlyForCameraToFollow){
            targetScallarMultiplier=5
        }

        // total duration of the asteroidG trajectory course
        let duration = timeBeforeIntersection*targetScallarMultiplier
        // account for the early impact adjustment 
        duration = duration + duration*(1-intersectionTrajectoryPercentageToPhysicalHit)

        const asteroidGroup = new THREE.Group()
        const asteroidObj = asteroidsScene.children[getRandomInt(0, 8)].clone()
        if(!onlyForCameraToFollow){
            asteroidObj.position.set(0,0,0)
            asteroidGroup.add(asteroidObj)
            // animate random rotation on asteroidG
            gsap.to(asteroidObj.rotation,  {
                duration: duration,
                x: "random(-20.0,20.0)",
                y: "random(-20.0,20.0)",
            })
        }
        const randomSize = getRandomArbitrary(minAsteroidSize, maxAsteroidSize)
        asteroidGroup.scale.set(randomSize, randomSize, randomSize)


        let count = 0
        // maxTries: tries to find a random position that fits the requirements bellow
        let maxTries = 200 
        const cameraDirection = new Vector3()

        // Find coordinates for a random point within the radius of 10 and outside the radius of 6
        do {
            const random = Math.random() *maxSpawnRangeL 
            x = Math.sin(random) *maxSpawnRangeL - ((Math.random()-0.5)*minSpawnRangeL)
            y = (Math.random()-0.5)* maxAmplitudeYRangeL
            z = Math.cos(random) *maxSpawnRangeL - ((Math.random()-0.5)*minSpawnRangeL)
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
            asteroidGroup.position.set(x, y, z)
            const axisOfRotation = new Vector3(0, 1, 0)
            // rotate the calculated asteroidG position on the Y axis around the center of the world and to the right of the camera
            rotateAboutPoint(asteroidGroup, center, axisOfRotation, -spawnAngle)
            scene.add(asteroidGroup)
            
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
            if(willHit || onlyForCameraToFollow){    
                // values that guarantee a spaceship hit
                maxScalarOffsetMultiplier = 0.4
                minScalarOffsetMultiplier = 0
            } else {
                // values that guarantee a spaceship miss
                maxScalarOffsetMultiplier = maxRandomOffsetMiss || 20
                minScalarOffsetMultiplier = 1.7
            }
            // spawning position of the asteroidG
            const spawnPointVec3 = asteroidGroup.position.clone()
            // position parallel offset from the spaceship, the bigger the value the bigger the trajectory arc around the ship 
            const intersectionScalarOffsetMultiplier = (Math.random()<0.5?1:-1)*getRandomArbitrary(minScalarOffsetMultiplier, maxScalarOffsetMultiplier)
            
            // Add Overlay and hitbox mesh
            let clickablePlane
            if(hasOverlay){
                clickablePlane = new THREE.Mesh(planeGeometry, planeMaterial)
                clickablePlane.position.set(0,0,3)
                clickablePlane.visible = dev_showPlane
                asteroidGroup.add(clickablePlane)
                asteroidArrayClickable.push(clickablePlane)
                const clickablePlaneIndex = asteroidArrayClickable.length - 1
                spawnPointOverlay(asteroidGroup, spawnNumber!==undefined?spawnNumber:"not_set", clickablePlaneIndex)
            }

            const asteroidProps = {
                asteroidG: asteroidGroup, 
                asteroidObj: asteroidObj, 
                clickablePlane,
                spawnPointVec3,
                intersectionPointVec3: new Vector3(),
                trajectoryObj,
                timeout: elapsedTime+duration,
                duration, 
                targetScallarMultiplier,
                intersectionScalarOffsetMultiplier,
                hasOverlay,
                willHit,
                onlyForCameraToFollow
            }
            asteroidArray.push(asteroidProps)
        }
    }
}

const removeAsteroid = (scene, asteroidG, hasOverlay, trajectoryObj) => {
    scene.remove(asteroidG)
    if(hasOverlay){
        removePointOverlay(asteroidG)
    }
    if(dev_showTrajectories){
        scene.remove(trajectoryObj)
    }
}

const doesAsteroidArrayHaveCurrentWillHit = () => {
    return asteroidArray.filter(asteroid => asteroid.willHit === true).length>0
}

const asteroidTick = (elapsedTime, scene, camera, dev_freeView) => {
    // Cast a ray from the mouse and handle events
    mouseRaycaster.setFromCamera(mouse, camera)
    const intersects = mouseRaycaster.intersectObjects(asteroidArrayClickable)
    
    if(intersects.length) { currentIntersect = intersects[0] }
    else { currentIntersect = null }

    let gameOver = false

    let cameraAlreadyFollowingSomething = false
    // reverse iteration for convinience of cameraAlreadyFollowingSomething, makes it easier to follow the latest (specific) asteroidG that needs following 
    asteroidArray = asteroidArray.filter( asteroid => {
        const {
            asteroidG, 
            asteroidObj,
            clickablePlane,
            spawnPointVec3, 
            trajectoryObj, 
            intersectionPointVec3,
            timeout, 
            duration,
            targetScallarMultiplier,
            intersectionScalarOffsetMultiplier,
            hasOverlay,
            willHit,
            onlyForCameraToFollow
        } = asteroid
        const gameIsPlaying =  getIsGamePlaying()
        if(clickablePlane){
            asteroidG.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 )
            asteroidG.lookAt(camera.position)
        }
        if(elapsedTime<timeout){
            const trajectoryProgress = (duration - timeout + elapsedTime)/duration
            // the intersection timing is the same regardless of hit or miss 
            // intersection with spaceship happens at 1/targetScallarMultiplier of the curve (which is targetScallarMultiplier times bigger than 1/targetScallarMultiplier)
            const progressToIntersection = 1/targetScallarMultiplier
            // lerpFactor [ 0 ; 1 ]
            const lerpFactor = trajectoryProgress / progressToIntersection
            // Camera Rotation to follow a given asteroidG
            if(!dev_freeView && !cameraAlreadyFollowingSomething && onlyForCameraToFollow && !spaceshipProps.spaceshipDestroyed){
                cameraAlreadyFollowingSomething = true
                const aspectRatio = window.innerHeight/window.innerWidth
                // update camera looking direction
                if(trajectoryProgress <= progressToIntersection){
                    if(aspectRatio<1){
                        // use this for horizontal screens
                        cameraProps.cameraLookPosition = cameraProps.cameraLookPosition.clone()
                            .lerp(asteroidG.position.clone()
                                .add(intersectionPointVec3)
                                .multiplyScalar(0.5),
                                lerpFactor
                            )
                    } else {
                        // use this for vertical screens
                        cameraProps.cameraLookPosition = cameraProps.cameraLookPosition.clone().lerp(asteroidG.position.clone(), lerpFactor)
                    }
                } else {
                    // progressToIntersection < trajectoryProgress < 2*progressToIntersection
                    if(trajectoryProgress>progressToIntersection && trajectoryProgress<(2*progressToIntersection)){
                        cameraProps.cameraLookPosition = cameraProps.cameraLookPosition.clone().lerp(cameraProps.cameraDummyPoint, (trajectoryProgress/(progressToIntersection)-1))
                    } else {
                        cameraProps.cameraLookPosition = cameraProps.cameraDummyPoint
                    }
                }
            } 
            // only update intersectionPointVec3 until asteroidG has reached/passed spaceship position
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
            // up is added because as the ship goes above and bellow y=0 , it changes the direction of the vector, so we add a vector "up" to offset it (it is normalized anyway)
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
                const points = curve.getPoints(50)
                trajectoryObj.geometry.setFromPoints(points)
            }
            const newPosition = curve.getPoint(trajectoryProgress)
            asteroidG.position.copy(newPosition)
            if(willHit && gameIsPlaying){
                // update time before impact (this is used in the overlay to show the seconds left before impact)
                const liveTimeBeforeIntersection =  Math.floor(duration/targetScallarMultiplier - (trajectoryProgress / progressToIntersection)*(duration/targetScallarMultiplier))
                console.log(liveTimeBeforeIntersection)
                setLiveTimeBeforeCollision(liveTimeBeforeIntersection)
            } else if(!gameIsPlaying){
                setLiveTimeBeforeCollision(0)
            }

            // asteroidG hits the ship
            if((trajectoryProgress > progressToIntersection*intersectionTrajectoryPercentageToPhysicalHit) && willHit && gameIsPlaying && !onlyForCameraToFollow && !asteroidG.isRemoving){
                gameOver = true
                removeAsteroid(scene, asteroidG, hasOverlay, trajectoryObj)
                spaceshipDestroy(scene, elapsedTime)
                // TODO !! only remove one per turn!!! 
            } else if (willHit && !gameIsPlaying) {
                removeAsteroid(scene, asteroidG, hasOverlay, trajectoryObj)
                return false
            }
            if(clickablePlane && !asteroidG.isRemoving){
                // when an asteroid is clicked
                if(clickablePlane.wasClicked){
                    spawnExplosion(asteroidG)
                    asteroidG.isRemoving = true
                    asteroidObj.visible = false
                    removePointOverlay(asteroidG)
                } 
            }
        } else {
            removeAsteroid(scene, asteroidG, hasOverlay, trajectoryObj)
            return false
        }
        return true
    })
    explosionsTick(elapsedTime)
    // cleanup the array at the end to avoid weird behaviour and extra overhead 
    if(gameOver){
        // condition for the asteroids to keep
        // elapsedTime-10 is to ensure that the tick has time to remove them from scene
        asteroidArray = asteroidArray.filter( asteroid => asteroid.willHit !== true && asteroid.onlyForCameraToFollow !== true && asteroid.timeout>=elapsedTime-10)
    }
    console.log(asteroidArray)
}





export {setupAsteroids, spawnAsteroid, asteroidTick, getLiveTimeBeforeCollision, doesAsteroidArrayHaveCurrentWillHit}
