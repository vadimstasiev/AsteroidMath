import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraTrajectoryParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep } from './Helpers'
import {setupSpaceshipOverlay, spawnSpaceshipOverlay, spaceshipOverlayTick} from './SpaceshipOverlay'

let points = []
let isPlaying = false
let messagesShownOnce = false

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
})

const setupGame = (getElapsedTime, scene, camera) => {
    
    // spawn some asteroids by default
    setInterval(() => { 
        spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 0.5})
    }, getRandomInt(10, 2000))
    
    // show/hide buttons
    setInterval(() => { 
        if(isPlaying){
            for(const element of document.getElementsByClassName('menu-buttons')){
                element.style.display = 'none'
            }
            for(const element of document.getElementsByClassName('play-menu')){
                element.style.display = 'flex'
            }
        } else {
            for(const element of document.getElementsByClassName('menu-buttons')){
                element.style.display = ''
            }
            for(const element of document.getElementsByClassName('play-menu')){
                element.style.display = 'none'
            }
        }
    }, getRandomInt(1000))
}

const introMessages = [
    {
        message: "Oh, Hi !",
        offsetX: 90,
        offsetY: -100,
        duration: 3,
        wait: 1
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
        duration: 4,
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
        offsetY: -170,
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
        wait: 2
    },
]

const quitClicked = () => {
    isPlaying = false
    gsap.to(cameraTrajectoryParams,  {
        duration: 2,
        // manually set values back to default, (check Spaceship.js for default values)
        cameraToSpaceshipOffset: 0.4,
        cameraRadiusMultiplier: 0.7,
    })
}

const playClicked = async (getElapsedTime, scene, camera) => {        
    if(!isPlaying){
        isPlaying = true
        const currentShowMessages = !messagesShownOnce
        if(!messagesShownOnce){
            messagesShownOnce = true
        }
        if(currentShowMessages){
            await showMessages(introMessages, getElapsedTime)
        }
        // Move camera further away for better visibility
        gsap.to(cameraTrajectoryParams,  {
            duration: 2,
            cameraToSpaceshipOffset: 2,
            cameraRadiusMultiplier: 0.3,
        })
        // Spawn dense asteroid zone
        const spawnDenseZoneAsteroids = (interval=0) => {
            setTimeout(() => { 
                // check if is playing to disrupt the loop when the game is over
                if(isPlaying){
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                    spawnDenseZoneAsteroids(getRandomInt(50, 200))
                }
            }, interval)
        }
        spawnDenseZoneAsteroids()
    }
    // spawnAsteroid(getElapsedTime(), scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
}

const showMessages = async (messages, getElapsedTime) => {
    for (const msg of messages){
        if(isPlaying){
            const {message, offsetX, offsetY, duration, wait} = msg
            spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY})
            await sleep(duration+wait)
        }
    } 
}

const playTick = (elapsedTime, scene, camera) => {
    if(isPlaying){

    }
} 


export {setupGame, playClicked, quitClicked, playTick}
