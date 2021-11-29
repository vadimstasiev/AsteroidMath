import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraTrajectoryParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'

let points = []

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
})

const playClicked = (elapsedTime, scene, camera) => {
    spawnAsteroid(elapsedTime, scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
    for (let i = 0; i < 10  ; i++) {
        spawnAsteroid(elapsedTime, scene, camera, {timeBeforeIntersection: 2})
    }
    gsap.to(cameraTrajectoryParams,  {
        duration: 2,
        cameraRadiusMultiplier: 0.5,
        // cameraAmplitudeOffset: 2
    })
}


export {playClicked}
