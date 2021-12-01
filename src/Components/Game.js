import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraTrajectoryParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt } from './Helpers'
import {setupSpaceshipOverlay, spawnSpaceshipOverlay, spaceshipOverlayTick} from './SpaceshipOverlay'

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

    if(!isPlaying){
        isPlaying = true
        // Move camera further away for better visibility
        gsap.to(cameraTrajectoryParams,  {
            duration: 2,
            cameraRadiusMultiplier: 0.5,
        })
        let messages = [
            {
                message: "Oh, Hi !",
                offsetX: 90,
                offsetY: -100,
                duration: 3,
            },
            {
                message: "I see you love doing Maths !",
                offsetX: 0,
                offsetY: 80,
                duration: 3,
                wait: 1
            },
            {
                message: "You don't !?",
                offsetX: 90,
                offsetY: -100,
                duration: 2,
                wait: 1
            },
            {
                message: "Oh",
                offsetX: 90,
                offsetY: -100,
                duration: 1,
                wait: 3
            },
            {
                message: "Well, you may not know this, but I'm in a bit of trouble...",
                offsetX: 20,
                offsetY: 100,
                duration: 5,
                wait: 1
            },
            {
                message: "There is a dense asteroid zone coming up ahead.",
                offsetX: 20,
                offsetY: 100,
                duration: 3,
                wait: 1
            },
            {
                message: "And the only thing that can help me get through that is if you help me do some Maths really quickly.",
                offsetX: 100,
                offsetY: -140,
                duration: 6,
                wait: 2
            },
            {
                message: "Here is your chance to leave and survive if you think you can't do it ! (......)",
                offsetX: 20,
                offsetY: 70,
                duration: 6,
                wait: 2
            },
            {
                message: "You're still here ?! Take your sit Captain !",
                offsetX: 100,
                offsetY: -100,
                duration: 3,
                wait: 1
            },
            {
                message: "You're awesome ! Here it comes then...",
                offsetX: 0,
                offsetY: 70,
                duration: 3,
                wait: 4
            },
        ]
        
        // Spawn dense asteroid zone
        const spawnDenseZoneAsteroids = (wait) => {
            setTimeout(() => { 
                // for (let i = 0; i < 3; i++) {
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                // }
                spawnDenseZoneAsteroids()
            }, getRandomInt(10, 200)+wait*1000)
        }

        const betweenMsgInterval = 1000
        const showMessages = (msgDuration=0, wait=0) => {
            setTimeout(() => { 
                const {message, offsetX, offsetY, duration, wait} = messages[0]
                spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY})
                if(messages[1]!==undefined){
                    showMessages(duration, wait)
                    messages.shift()
                } else {
                    spawnDenseZoneAsteroids(wait)
                }
            }, ((msgDuration+wait)*1000))
        }
        showMessages()
        
    }
    // spawnAsteroid(getElapsedTime(), scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
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
