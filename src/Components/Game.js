import gsap from 'gsap'
import { elapsedTimeTick, getElapsedTime, getterSetter } from './Helpers'
import { spaceShipParams, cameraParams, spaceshipRespawn } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep, strReplaceAllOccurences } from './Helpers'
import { showDeathMessages, showMessages} from './SpaceshipOverlay'
import {introMessages, tutorialMessages, deathMessages} from './Messages'


// dev - hide introductory and tutorial messages for faster troubleshooting
const dev_hideMessages = true


const [getIsGamePlaying, setIsGamePlaying] = getterSetter(false)
let isMessagesShownOnce = false
const [getIsIntroPlaying, setIsIntroPlaying] = getterSetter(false)
const [getIsTutPlaying, setIsTutPlaying] = getterSetter(false)
// let isTutPlaying = false
let isSkipIntroduction = false
let isSkipTutorial = false

const skipIntroduction = () => {
    isSkipIntroduction=true
    setIsIntroPlaying(false)
}
const skipTutorial = () => {
    isSkipTutorial = true
    setIsTutPlaying(false)
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

    // make game-ui visible
    for(const element of document.getElementsByClassName('game-ui')){
        element.classList.add("show")
    }
    
    // show/hide buttons
    setInterval(() => { 
        if(getIsGamePlaying()){
            for(const element of document.getElementsByClassName('navbar-play-and-leaderboard')){
                element.style.display = 'none'
            }
            for(const element of document.getElementsByClassName('play-and-leaderboard')){
                element.style.display = 'flex'
            }
            // hide/show skip intro button
            if(getIsIntroPlaying()){
                for(const element of document.getElementsByClassName('skip-intro')){
                    element.style.display = ''
                }
            } else {
                for(const element of document.getElementsByClassName('skip-intro')){
                    element.style.display = 'none'
                }
                // Get rid of existing ongoing messages if the button skip has been clicked already 
                for(const element of document.getElementsByClassName('intro-message')){
                    element.style.display = 'none'
                }
            } 
            // hide/show skip tutorial button   
            if(getIsTutPlaying()){
                for(const element of document.getElementsByClassName('skip-tut')){
                    element.style.display = ''
                }
            } else {
                for(const element of document.getElementsByClassName('skip-tut')){
                    element.style.display = 'none'
                }
                // Get rid of existing ongoing messages if the button skip has been clicked already 
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
            for(const element of document.getElementsByClassName('navbar-play-and-leaderboard')){
                element.style.display = ''
            }
            for(const element of document.getElementsByClassName('play-and-leaderboard')){
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
    setIsGamePlaying(false)

    // initial messages
    isMessagesShownOnce = true
    setIsIntroPlaying(false)
    setIsTutPlaying(false)
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
    if(!getIsGamePlaying()){
        setIsGamePlaying(true)
        nextSpawnTime = 0
        const currentShowOnceMessagesB = !isMessagesShownOnce
        if(!isMessagesShownOnce){
            isMessagesShownOnce = true
        }
        if(currentShowOnceMessagesB && !dev_hideMessages){
            await showMessages(getIsGamePlaying, introMessages, getElapsedTime, setIsIntroPlaying, getIsIntroPlaying, 'intro-message')
        }
        // Spawn dense asteroid zone
        const spawnDenseZoneAsteroids = (interval=0) => {
            setTimeout(() => { 
                // check if is playing to disrupt the loop when the game is over
                if(getIsGamePlaying()){
                    spawnAsteroid(getElapsedTime(), scene, camera, {timeBeforeIntersection: 2})
                    spawnDenseZoneAsteroids(getRandomInt(50, 200))
                }
            }, interval)
        }
        spawnDenseZoneAsteroids()
        if(currentShowOnceMessagesB && !dev_hideMessages){
            await showMessages(getIsGamePlaying, tutorialMessages, getElapsedTime, setIsTutPlaying, getIsTutPlaying, 'tut-message')
        }
        // Move camera further away for better visibility
        if(getIsGamePlaying()){
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
    }
}

window.generateRandomQuestion = (minNumber = 2, maxNumber = 9, maxNumberOfOperations=1, sign="-") => {
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

    let answer = ""
    if (sign!==signConversion[sign]){
        answer = eval(strReplaceAllOccurences(question, sign, signConversion[sign]))
    } else {
        answer = eval(question)
    }

    let getWrongAnswer = (minOffset=1, maxOffset=100) => (Math.random()>0.5)?(answer+getRandomInt(minOffset, maxOffset)):(answer-getRandomInt(1, 100))
	return {question, answer, getWrongAnswer}
}


let nextSpawnTime = 0
const spawnInterval = 10
const playTick = (elapsedTime, scene, camera) => {
    if(!windowHasFocus()){
        setIsGamePlaying(false)
        spaceShipParams.spaceshipDestroyed = false
        spaceshipRespawn(scene)
    }
    if(getIsGamePlaying()){
        if(nextSpawnTime < elapsedTime){
            nextSpawnTime = elapsedTime + spawnInterval
            spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: 3, spawnNumber: 4})
            spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
            spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})
        }
    }
} 


export {setupGame, playClicked, skipIntroduction, skipTutorial, quitGame, gameOver, playTick, getIsGamePlaying}
