import gsap from 'gsap'
import { elapsedTimeTick, getElapsedTime, getterSetter } from './Helpers'
import { spaceshipProps, cameraProps, spaceshipRespawn, spaceshipG } from './Spaceship'
import { spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep, strReplaceAllOccurences } from './Helpers'
import { showDeathMessages, showMessages} from './SpaceshipOverlay'
import {introMessages, tutorialMessages, deathMessages} from './Messages'


// dev - hide introductory and tutorial messages for faster troubleshooting
const dev_hideMessages = false


const [getIsMessagesShownOnce, setIsMessagesShownOnce] = getterSetter(false)
const [getIsGamePlaying, setIsGamePlaying] = getterSetter(false)

const [getIsIntroPlaying, setIsIntroPlaying] = getterSetter(false)
const [getIsTutPlaying, setIsTutPlaying] = getterSetter(false)

const [getNextSpawn, setNextSpawn] = getterSetter(null)

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
    
    // show/hide buttons / toggle settings
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
            if(spaceshipProps.spaceshipDestroyed){
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
        if(getIsGamePlaying() && !getIsIntroPlaying() && !getIsTutPlaying()) {
            // Move camera further away for better visibility
            gsap.to(cameraProps,  {
                duration: 2,
                cameraToSpaceshipOffset: 2,
                cameraDummyPointOffset: 1,
                cameraRadiusMultiplier: 0.3,
            })
        } else if(spaceshipProps.spaceshipDestroyed){
            gsap.to(cameraProps,  {
                duration: 2,
                cameraToSpaceshipOffset: 2,
                cameraDummyPointOffset: 1,
                cameraRadiusMultiplier: 0.3,
            })
        } else {
            gsap.to(cameraProps,  {
                duration: 2,
                // manually set values back to default, (check Spaceship.js for default values)
                cameraDummyPointOffset: 0,
                cameraToSpaceshipOffset: 0.4,
                cameraRadiusMultiplier: 0.7,
            })
        }
    }, getRandomInt(1000))
}

const quitGame = async () => {
    // make timebar invisible
    for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
        element.classList.remove("show")
    }
    setIsGamePlaying(false)

    // initial messages
    setIsMessagesShownOnce(true)
    setIsIntroPlaying(false)
    setIsTutPlaying(false)
}

const gameOver = async scene => {
    if(spaceshipProps.spaceshipDestroyed){
        showDeathMessages([deathMessages[getRandomInt(0,deathMessages.length-1)]], getElapsedTime)
    }
    await spaceshipRespawn(scene, spaceshipProps.timeBeforeRespawn)
    setIsGamePlaying(false)
}


const playClicked = async (scene, camera) => {        
    if(!getIsGamePlaying()){
        setIsGamePlaying(true)
        const isShowingMessages = !getIsMessagesShownOnce()
        if(isShowingMessages){
            setIsMessagesShownOnce(true)
        }
        if(isShowingMessages && !dev_hideMessages){
            setIsIntroPlaying(true)
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
        if(isShowingMessages && !dev_hideMessages){
            setIsTutPlaying(true)
            await showMessages(getIsGamePlaying, tutorialMessages, getElapsedTime, setIsTutPlaying, getIsTutPlaying, 'tut-message')

        }


        // make timebar visible
        for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
            element.classList.add("show")
        }
        setNextSpawn(0)
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

const spawnInterval = 10
const playTick = (elapsedTime, scene, camera) => {
    if(!windowHasFocus()){
        setIsGamePlaying(false)
        spaceshipProps.spaceshipDestroyed = false
        spaceshipRespawn(scene)
    }
    if(getIsGamePlaying()){
        const nextSpawn = getNextSpawn()
        if(nextSpawn!==null && nextSpawn < elapsedTime){
            setNextSpawn(elapsedTime + spawnInterval)
            spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: 3, spawnNumber: 4})
            spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
            spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})
        }
    }
} 


export {setupGame, playClicked, quitGame, setIsIntroPlaying, setIsTutPlaying, gameOver, playTick, getIsGamePlaying}
