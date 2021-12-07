import gsap from 'gsap'
import { elapsedTimeTick, getElapsedTime } from './Helpers'
import { spaceShipParams, cameraParams, spaceshipRespawn } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep, strReplaceAllOccurences } from './Helpers'
import { showDeathMessages, showMessages} from './SpaceshipOverlay'
import {introMessages, tutorialMessages, deathMessages} from './Messages'


// dev - hide introductory and tutorial messages for faster troubleshooting
const hideMessages = true


let isGamePlaying = false
let isMessagesShownOnce = false
let isIntroPlaying = false
let isTutPlaying = false
let isSkipIntroduction = false
let isSkipTutorial = false

const skipIntroduction = () => {
    isSkipIntroduction=true
    isIntroPlaying = false
}
const skipTutorial = () => {
    isSkipTutorial = true
    isTutPlaying = false
}

const setIsGamePlaying = value => {isGamePlaying = value}

const getIsGamePlaying = () => isGamePlaying

const windowHasFocus = () => {
    if (document.hasFocus()) return true
    let windowIsFocused = false
    window.addEventListener('focus', () => {
        windowIsFocused = true
    })
    window.focus()
    return windowIsFocused
}

const setupGame = (scene, camera) => {
    // spawn some asteroids by default
    setInterval(() => { 
        spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 0.5})
    }, getRandomInt(10, 2000))

    // make game-ui visible
    for(const element of document.getElementsByClassName('game-ui')){
        element.classList.add("show")
    }
    
    // show/hide buttons
    setInterval(() => { 
        if(isGamePlaying){
            for(const element of document.getElementsByClassName('menu-buttons')){
                element.style.display = 'none'
            }
            for(const element of document.getElementsByClassName('play-menu')){
                element.style.display = 'flex'
            }
            if(isIntroPlaying){
                for(const element of document.getElementsByClassName('skip-intro')){
                    element.style.display = ''
                }
            } else {
                for(const element of document.getElementsByClassName('skip-intro')){
                    element.style.display = 'none'
                }
            }    
            if(isSkipIntroduction){
                for(const element of document.getElementsByClassName('intro-message')){
                    element.style.display = 'none'
                }
            }
            if(isTutPlaying){
                for(const element of document.getElementsByClassName('skip-tut')){
                    element.style.display = ''
                }
            } else {
                for(const element of document.getElementsByClassName('skip-tut')){
                    element.style.display = 'none'
                }
            }
            if(isSkipTutorial){
                for(const element of document.getElementsByClassName('tut-message')){
                    element.style.display = 'none'
                }
            }
            if(spaceShipParams.spaceshipDestroyed){
                for(const element of document.getElementsByClassName('quit')){
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
            for(const element of document.getElementsByClassName('quit')){
                element.style.display = ''
            }
        }
    }, getRandomInt(1000))
}

const quitGame = async () => {
    gsap.to(cameraParams,  {
        duration: 2,
        // manually set values back to default, (check Spaceship.js for default values)
        cameraDummyPointOffset: 0,
        cameraToSpaceshipOffset: 0.4,
        cameraRadiusMultiplier: 0.7,
    })
    // make timebar invisible
    for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
        element.classList.remove("show")
    }
    isGamePlaying = false

    // initial messages
    isMessagesShownOnce = true
    isIntroPlaying = false
    isTutPlaying = false
    isSkipIntroduction=true
    isSkipTutorial = true
}

const gameOver = scene => {
    if(spaceShipParams.spaceshipDestroyed){
        showDeathMessages([deathMessages[getRandomInt(0,deathMessages.length-1)]], getElapsedTime)
    }
    gsap.to(cameraParams,  {
        duration: 2,
        // manually set values back to default, (check Spaceship.js for default values)
        cameraDummyPointOffset: 0,
        cameraToSpaceshipOffset: 0.4,
        cameraRadiusMultiplier: 0.7,
    })
    spaceshipRespawn(scene, setIsGamePlaying)
}


const playClicked = async (scene, camera) => {        
    if(!isGamePlaying){
        isGamePlaying = true
        nextSpawnTime = 0
        const currentShowOnceMessagesB = !isMessagesShownOnce
        if(!isMessagesShownOnce){
            isMessagesShownOnce = true
        }
        if(currentShowOnceMessagesB && !hideMessages){
            await showMessages(getIsGamePlaying, introMessages, getElapsedTime, (ref) => {isIntroPlaying = ref}, () => isSkipIntroduction, 'intro-message')
        }
        // Spawn dense asteroid zone
        const spawnDenseZoneAsteroids = (interval=0) => {
            setTimeout(() => { 
                // check if is playing to disrupt the loop when the game is over
                if(isGamePlaying){
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                    spawnDenseZoneAsteroids(getRandomInt(50, 200))
                }
            }, interval)
        }
        spawnDenseZoneAsteroids()
        if(currentShowOnceMessagesB && !hideMessages){
            await showMessages(getIsGamePlaying, tutorialMessages, getElapsedTime, (ref) => {isTutPlaying = ref}, () => isSkipTutorial, 'tut-message')
        }
        // Move camera further away for better visibility
        if(isGamePlaying){
            gsap.to(cameraParams,  {
                duration: 2,
                cameraToSpaceshipOffset: 2,
                cameraDummyPointOffset: 1,
                cameraRadiusMultiplier: 0.3,
            })
        }

        // make timebar visible
        for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
            element.classList.add("show")
        }
        // while(isGamePlaying) {
        //     console.log('going')
        //     if(!spaceShipParams.spaceshipDestroyed){
        //         // await sleep(5)
        //         if(isGamePlaying){
        //             spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: 3, spawnNumber: 4})
        //             spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
        //             spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})
        //         }
        //         // await sleep(20)
        //     }
        // }
    }
}

const generateRandomQuestion = (minNumber = 2, maxNumber = 9, maxNumberOfOperations=1, sign="+") => {
    const numberOfOperations = getRandomInt(1, maxNumberOfOperations)
    
    let question = ""

    for (let i = 0; i <= numberOfOperations; i++) {
        if(i===0){
            // if first number dont add sign
            question += getRandomInt(minNumber, maxNumber)
        } else {
            question += ` ${sign} ` + getRandomInt(minNumber, maxNumber)
        }
    }

    const signConversion = {
        "+": "+", 
        "-":"-",
        "x":"*",
        ":":"/",
    }
    
    const answer = eval(strReplaceAllOccurences(question, sign, signConversion[sign]))

    const getWrongAnswer = (minOffset=1, maxOffset=100) => Math.abs((Math.random()>0.5)?(answer+getRandomInt(minOffset, maxOffset)):(answer-getRandomInt(1, 100)))
	return {question, answer, getWrongAnswer}
}


let nextSpawnTime = 0
const spawnInterval = 10
const playTick = (elapsedTime, scene, camera) => {
    if(!windowHasFocus()){
        isGamePlaying = false
        spaceShipParams.spaceshipDestroyed = false
        spaceshipRespawn(scene)
    }
    if(isGamePlaying){
        if(nextSpawnTime < elapsedTime){
            nextSpawnTime = elapsedTime + spawnInterval
            spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: 3, spawnNumber: 4})
            spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
            spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})
        }
    }
} 


export {setupGame, playClicked, skipIntroduction, skipTutorial, quitGame, gameOver, playTick, getIsGamePlaying}
