import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep } from './Helpers'
import {setupSpaceshipOverlay, spawnSpaceshipOverlay, spaceshipOverlayTick} from './SpaceshipOverlay'


// dev - hide introductory and tutorial messages for faster troubleshooting
const hideMessages = true


let isPlaying = false
let messagesShownOnce = false
let introIsPlaying = false
let tutIsPlaying = false
let skipIntroductionB = false
let skipTutorialB = false
const skipIntroduction = () => {
    skipIntroductionB=true
    introIsPlaying = false
}
const skipTutorial = () => {
    skipTutorialB = true
    tutIsPlaying = false
}

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
            if(introIsPlaying){
                for(const element of document.getElementsByClassName('skip-intro')){
                    element.style.display = ''
                }
            } else {
                for(const element of document.getElementsByClassName('skip-intro')){
                    element.style.display = 'none'
                }
            }    
            if(tutIsPlaying){
                for(const element of document.getElementsByClassName('skip-tut')){
                    element.style.display = ''
                }
            } else {
                for(const element of document.getElementsByClassName('skip-tut')){
                    element.style.display = 'none'
                }
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
        duration: 2.5,
        wait: 1
    },
    {
        message: "Oh",
        offsetX: 90,
        offsetY: -100,
        duration: 1,
        wait: 2
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
        offsetX: 70,
        offsetY: 80,
        duration: 3,
        wait: 1
    },
    {
        message: "And the only way to get us through it is if you help us do some Maths really quickly.",
        offsetX: 100,
        offsetY: -170,
        duration: 6,
        wait: 2
    },
    {
        message: "Here is your chance to leave and survive if you think you can't handle it ! (......)",
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

const tutorialMessages = [
    {
        message: "The spaceship navigation system works for the most part...",
        offsetX: 100,
        offsetY: -120,
        duration: 5,
        wait: 1
    },
    {
        message: "But sometimes it fails and needs manual takeover.",
        offsetX: 50,
        offsetY: 80,
        duration: 3,
        wait: 1
    },
    {
        message: "I need you to click on the right answer in time to prevent us crashing the ship.",
        offsetX: 50,
        offsetY: 100,
        duration: 4,
        wait: 1
    },
    {
        message: "Good Luck!",
        offsetX: 90,
        offsetY: -100,
        duration: 1,
        wait: 3
    },
]

const quitGame = async (isPlayingDelay=0) => {
    gsap.to(cameraParams,  {
        duration: 2,
        // manually set values back to default, (check Spaceship.js for default values)
        cameraDummyPointOffset: 0,
        cameraToSpaceshipOffset: 0.4,
        cameraRadiusMultiplier: 0.7,
    })
    await sleep(isPlayingDelay)
    isPlaying = false
}

const playClicked = async (getElapsedTime, scene, camera) => {        
    if(!isPlaying){
        isPlaying = true
        const currentShowMessages = !messagesShownOnce
        if(!messagesShownOnce){
            messagesShownOnce = true
        }
        if(currentShowMessages && !hideMessages){
            await showMessages(introMessages, getElapsedTime, (ref) => {introIsPlaying = ref}, () => skipIntroductionB)
        }
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
        if(currentShowMessages && !hideMessages){
            await showMessages(tutorialMessages, getElapsedTime, (ref) => {tutIsPlaying = ref}, () => skipTutorialB)
        }
        // Move camera further away for better visibility
        if(isPlaying){
            gsap.to(cameraParams,  {
                duration: 2,
                cameraToSpaceshipOffset: 2,
                cameraDummyPointOffset: 1,
                cameraRadiusMultiplier: 0.3,
            })
        }
        const whatever = (interval=0) => {
            setTimeout(() => { 
                // check if is playing to disrupt the loop when the game is over
                if(isPlaying){
                    if(!spaceShipParams.spaceshipDestroyed){
                        spawnAsteroid(getElapsedTime(), scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 3,})
                        spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true,})
                        spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5})

                    }
                    whatever(10000)
                }
            }, interval)
        }
        whatever()
    }
    // spawnAsteroid(getElapsedTime(), scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
}

const showMessages = async (messages, getElapsedTime, setMessageIsPlaying = (messageIsPlaying) => {}, playMessageContinue = () => false) => {
    setMessageIsPlaying(true)
    for (const msg of messages){
        if(isPlaying && !playMessageContinue()){
            const {message, offsetX, offsetY, duration, wait} = msg
            spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY})
            await sleep(duration+wait)
        }
    } 
    setMessageIsPlaying(false)
}

const playTick = (elapsedTime, scene, camera) => {
    if(isPlaying){

    }
} 


export {setupGame, playClicked, skipIntroduction, skipTutorial, quitGame, playTick}
