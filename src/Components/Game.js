import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraTrajectoryParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt } from './Helpers'

let points = []
let isPlaying = false

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
})

const setupGame = (getElapsedTime, scene, camera) => {
    const spawnBackroundAsteroids = () => {
        setTimeout(() => { 
                spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 0.5})
                spawnBackroundAsteroids()
        }, getRandomInt(10, 2000));
    }
    spawnBackroundAsteroids()
}

const playClicked = (getElapsedTime, scene, camera) => {
    // for (let i = 0; i < 10  ; i++) {
    //     spawnAsteroid(elapsedTime, scene, camera, {timeBeforeIntersection: 2})
    // }
    if(!isPlaying){
        isPlaying = true
        const spawnDenseZoneAsteroids = () => {
            setTimeout(() => { 
                if(isPlaying){
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                    spawnDenseZoneAsteroids()
                }
            }, getRandomInt(10, 200));
        }
        spawnDenseZoneAsteroids()
        gsap.to(cameraTrajectoryParams,  {
            duration: 2,
            cameraRadiusMultiplier: 0.5,
            // cameraAmplitudeOffset: 2
        })
    }
    spawnAsteroid(getElapsedTime(), scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
}

const playTick = (elapsedTime, scene, camera) => {
    if(isPlaying){
        // console.log(parseInt(elapsedTime%4))
        // if(elapsedTime%4===0){
        //     // spawnAsteroid(elapsedTime, scene, camera, {timeBeforeIntersection: 2})
        // }
    }
} 


export {setupGame, playClicked, playTick}
