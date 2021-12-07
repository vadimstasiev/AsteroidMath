import gsap from 'gsap'
import { getElapsedTime } from './Helpers'
import { spaceShipParams, cameraParams, spaceshipRespawn } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep, strReplaceAllOccurences } from './Helpers'
import { showDeathMessages, showMessages} from './SpaceshipOverlay'
import {introMessages, tutorialMessages, deathMessages} from './Messages'


// dev - hide introductory and tutorial messages for faster troubleshooting
const hideMessages = false


let gameIsPlayingB = false
let messagesShownOnceB = false
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
const isGamePlaying = () => {
    return gameIsPlayingB
}

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
    
    // show/hide buttons
    setInterval(() => { 
        if(gameIsPlayingB){
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
            if(skipIntroductionB){
                for(const element of document.getElementsByClassName('intro-message')){
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
            if(skipTutorialB){
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

const quitGame = async (isPlayingDelay=0) => {
    gsap.to(cameraParams,  {
        duration: 2,
        // manually set values back to default, (check Spaceship.js for default values)
        cameraDummyPointOffset: 0,
        cameraToSpaceshipOffset: 0.4,
        cameraRadiusMultiplier: 0.7,
    })
    await sleep(isPlayingDelay)
    gameIsPlayingB = false
    messagesShownOnceB = true
    introIsPlaying = false
    tutIsPlaying = false
    skipIntroductionB=true
    skipTutorialB = true
}

const gameOver = async (scene) => {
    if(spaceShipParams.spaceshipDestroyed){
        await showDeathMessages([deathMessages[getRandomInt(0,deathMessages.length-1)]], getElapsedTime)
    }
    gsap.to(cameraParams,  {
        duration: 2,
        // manually set values back to default, (check Spaceship.js for default values)
        cameraDummyPointOffset: 0,
        cameraToSpaceshipOffset: 0.4,
        cameraRadiusMultiplier: 0.7,
    })
    // await sleep(3)
    gameIsPlayingB = false
    spaceshipRespawn(scene)
}


const playClicked = async (scene, camera) => {        
    if(!gameIsPlayingB){
        gameIsPlayingB = true
        const currentShowOnceMessagesB = !messagesShownOnceB
        if(!messagesShownOnceB){
            messagesShownOnceB = true
        }
        if(currentShowOnceMessagesB && !hideMessages){
            await showMessages(isGamePlaying, introMessages, getElapsedTime, (ref) => {introIsPlaying = ref}, () => skipIntroductionB, 'intro-message')
        }
        // Spawn dense asteroid zone
        const spawnDenseZoneAsteroids = (interval=0) => {
            setTimeout(() => { 
                // check if is playing to disrupt the loop when the game is over
                if(gameIsPlayingB){
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                    spawnDenseZoneAsteroids(getRandomInt(50, 200))
                }
            }, interval)
        }
        spawnDenseZoneAsteroids()
        if(currentShowOnceMessagesB && !hideMessages){
            await showMessages(isGamePlaying, tutorialMessages, getElapsedTime, (ref) => {tutIsPlaying = ref}, () => skipTutorialB, 'tut-message')
        }
        // Move camera further away for better visibility
        if(gameIsPlayingB){
            gsap.to(cameraParams,  {
                duration: 2,
                cameraToSpaceshipOffset: 2,
                cameraDummyPointOffset: 1,
                cameraRadiusMultiplier: 0.3,
            })
        }
        
        // seconds
        // let secondsTracker = 0
        // const gameLoopInterval = 0.5

        // const gameLoop = (interval=0) => {
        //     setTimeout(() => { 
        //         // check if is playing to disrupt the loop when the game is over
        //         if(gameIsPlayingB && !spaceShipParams.spaceshipDestroyed){
        //             console.log(secondsTracker%10, secondsTracker)
        //             // In (secondsTracker%10) the result goes from 0 to 9 
        //             if(secondsTracker%10 == 0){

        //                 spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: 3, spawnNumber: 4})
        //                 spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
        //                 spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})

        //             }
        //             secondsTracker += gameLoopInterval
        //             gameLoop(gameLoopInterval*1000)
        //         }
        //     }, interval)
        // }
        // gameLoop()

        while(gameIsPlayingB) {
            if(!spaceShipParams.spaceshipDestroyed){
                await sleep(5)
                spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: 3, spawnNumber: 4})
                spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
                spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})
                await sleep(10)
            }
        }
    }
    // spawnAsteroid(getElapsedTime(), scene, camera, {willHit: true, hasOverlay: true, timeBeforeIntersection: 2})
}

const generateRandomQuestion = (minNumber = 2, maxNumber = 9, maxNumberOfOperations=1, sign="+") => {
    const numberOfMultiplications = getRandomInt(1, maxNumberOfOperations)
    
    let question = ""

    for (let i = 0; i <= numberOfMultiplications; i++) {
        if(i===0){
            // if first number dont add sign
            question += getRandomInt(minNumber, maxNumber)
        } else {
            question += ` ${sign} ` + getRandomInt(minNumber, maxNumber)
        }
    }
    
    const answer = eval(strReplaceAllOccurences(question, sign, '*'))

    const getWrongAnswer = (minOffset=1, maxOffset=100) => Math.abs((Math.random()>0.5)?(answer+getRandomInt(minOffset, maxOffset)):(answer-getRandomInt(1, 100)))
	return {question, answer, getWrongAnswer}
}

const playTick = (elapsedTime, scene, camera) => {
    if(!windowHasFocus()){
        gameIsPlayingB = false
        spaceShipParams.spaceshipDestroyed = false
        spaceshipRespawn(scene)
    }
} 


export {setupGame, playClicked, skipIntroduction, skipTutorial, quitGame, gameOver, playTick, isGamePlaying}
