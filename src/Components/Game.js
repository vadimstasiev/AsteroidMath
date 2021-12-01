import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraTrajectoryParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'

let points = []
let isPlaying = false

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
})

const playClicked = (getElapsedTime, scene, camera) => {
    // spawnAsteroid(elapsedTime, scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
    // for (let i = 0; i < 10  ; i++) {
    //     spawnAsteroid(elapsedTime, scene, camera, {timeBeforeIntersection: 2})
    // }
    if(!isPlaying){
        isPlaying = true
        const spawnBackroundAsteroids = () => {
            setTimeout(() => { 
                if(isPlaying){
                    console.log('hello')
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                    spawnBackroundAsteroids()
                }
            }, 100);
        }
        spawnBackroundAsteroids()
        gsap.to(cameraTrajectoryParams,  {
            duration: 2,
            cameraRadiusMultiplier: 0.5,
            // cameraAmplitudeOffset: 2
        })
    }
}

const playTick = (elapsedTime, scene, camera) => {
    if(isPlaying){
        // console.log(parseInt(elapsedTime%4))
        // if(elapsedTime%4===0){
        //     // spawnAsteroid(elapsedTime, scene, camera, {timeBeforeIntersection: 2})
        // }
    }
} 


export {playClicked, playTick}
