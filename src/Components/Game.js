import gsap from 'gsap'
import { getElapsedTime, getterSetter } from './Helpers'
import { spaceshipProps, cameraProps, spaceshipRespawn, spaceshipG } from './Spaceship'
import { getLiveTimeBeforeCollision, spawnAsteroid } from './Asteroids'
import { getRandomInt, sleep, strReplaceAllOccurences } from './Helpers'
import { showDeathMessages, showMessages} from './SpaceshipOverlay'
import {introMessages, tutorialMessages, deathMessages} from './Messages'


// dev - hide introductory and tutorial messages for faster troubleshooting
const dev_hideMessages = false


const [getIsMessagesShownOnce, setIsMessagesShownOnce] = getterSetter(false)
const [getIsGamePlaying, setIsGamePlaying] = getterSetter(false)

const [getIsIntroPlaying, setIsIntroPlaying] = getterSetter(false)
const [getIsTutPlaying, setIsTutPlaying] = getterSetter(false)
const [getIsIntroSkipped, setIsIntroSkipped] = getterSetter(false)
const [getIsTutSkipped, setIsTutSkipped] = getterSetter(false)


const [getNextSpawn, setNextSpawn] = getterSetter(null)

const [getIsAskingQuestion, setIsAskingQuestion] = getterSetter(false)

const [getCurrentPlayTurn, setCurrentPlayTurn] = getterSetter(0)

// seconds
const delay = 3
const answerTime = 0 + delay
const spawnInterval = 10 + answerTime


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

    // make game-ui visible on game setup as is invisible by default to prevent elements from popping up before things are loaded 
    for(const element of document.getElementsByClassName('game-ui')){
        element.classList.add("show")
    }
    
    // show/hide buttons / toggle settings
    setInterval(() => { 
        if(getIsIntroSkipped()){
            setIsIntroPlaying(false)
        }
        if(getIsTutSkipped()){
            setIsTutPlaying(false)
        }
        // make these changes when game state is "playing"
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
            // make these changes when game state is "not playing"
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
        if(getIsGamePlaying() && (getIsIntroPlaying() || getIsTutPlaying())) {
            gsap.to(cameraProps,  {
                duration: 2,
                // manually set values back to default, (check Spaceship.js for default values)
                cameraDummyPointOffset: 0,
                cameraToSpaceshipOffset: 0.4,
                cameraRadiusMultiplier: 0.7,
            })
        } else if(getIsGamePlaying() && getIsAskingQuestion()) {
            gsap.to(cameraProps,  {
                duration: 2,
                // manually set values back to default, (check Spaceship.js for default values)
                cameraDummyPointOffset: 0.5,
                cameraToSpaceshipOffset: 0.4,
                cameraRadiusMultiplier: 0.7,
            })
        } else if(!getIsGamePlaying()) {
            gsap.to(cameraProps,  {
                duration: 2,
                cameraDummyPointOffset: 0,
                cameraToSpaceshipOffset: 0.4,
                cameraRadiusMultiplier: 0.7,
            })
        } else  {
            // Move camera further away for better visibility
            gsap.to(cameraProps,  {
                duration: 2,
                cameraToSpaceshipOffset: 1.5,
                cameraDummyPointOffset: 1,
                cameraRadiusMultiplier: 0.3,
            })
        } 
    }, getRandomInt(1000))
}

const quitGame = async () => {
    setIsGamePlaying(false)

    // skip initial messages
    setIsMessagesShownOnce(true)
    setIsIntroSkipped(true)
    setIsTutSkipped(true)
}

const gameOver = async scene => {
    if(spaceshipProps.spaceshipDestroyed){
        showDeathMessages([deathMessages[getRandomInt(0,deathMessages.length-1)]], getElapsedTime)
    }
    await spaceshipRespawn(scene, spaceshipProps.timeBeforeRespawn)
    setIsGamePlaying(false)
}


const playClicked = async (scene, camera) => {     
    const currentPlayTurn = getCurrentPlayTurn()   
    if(!getIsGamePlaying()){
        setIsGamePlaying(true)
        const isShowingMessages = !getIsMessagesShownOnce()
        if(isShowingMessages){
            setIsMessagesShownOnce(true)
        }
        if(isShowingMessages && !dev_hideMessages){
            setIsIntroPlaying(true)
            await showMessages(getIsGamePlaying, introMessages, getElapsedTime, setIsIntroPlaying, getIsIntroSkipped, 'intro-message')
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
            await showMessages(getIsGamePlaying, tutorialMessages, getElapsedTime, setIsTutPlaying, getIsTutSkipped, 'tut-message')

        }


        // // make timebar visible
        // for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
        //     element.classList.add("show")
        // }

        
        // make first spawn shorter
        setNextSpawn(getElapsedTime()+3)
        // setNextSpawn(getElapsedTime()+spawnInterval)
        setCurrentPlayTurn(currentPlayTurn+1)
    }
}

const generateRandomQuestion = (minNumber = 2, maxNumber = 9, maxNumberOfOperations=1, sign="-") => {
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

    const getWrongAnswer = (minOffset=1, maxOffset=100) => {
        const wrongAnswer = (Math.random()>0.5)?(answer+getRandomInt(minOffset, maxOffset)):(answer-getRandomInt(1, 100))
        if(answer>=0){
            return Math.abs(wrongAnswer)
        } else {
            return -Math.abs(wrongAnswer)
        }
    }
	return {question, answer, getWrongAnswer}
}

const startLoadingBar = async(currentPlayTurn, sleepTime) => {
    if(currentPlayTurn===getCurrentPlayTurn()){
        for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
            element.classList.add("show")
        }
        await sleep(sleepTime)
        for(const element of document.getElementsByClassName('game-ui-timerbar')){
            element.classList.add("ended")
            element.setAttribute("style", `transition: transform ${answerTime}s;`);
        }
        await sleep(answerTime)
        for(const element of document.getElementsByClassName('game-ui-timerbar-container')){
            element.classList.remove("show")
        }
        // await the hiding transition to prevent it showing the bar full again
        await sleep(answerTime)
        for(const element of document.getElementsByClassName('game-ui-timerbar')){
            element.classList.remove("ended")
        }
    }
}

const startGameChallenge = async(currentPlayTurn, sleepTime, scene, camera) => {
    if(currentPlayTurn===getCurrentPlayTurn()){
        const question = generateRandomQuestion()
        let titleElement
        let questionElement
        for(const element of document.getElementsByClassName('math-question')){
            for(const insideElement of element.getElementsByClassName('title')){
                titleElement = insideElement
            }
            for(const insideElement of element.getElementsByClassName('question')){
                questionElement = insideElement
            }
        }

        titleElement.classList.add("show")
        titleElement.innerHTML="Collision Detected!"
        questionElement.innerHTML = question.question + '='

        questionElement.classList.add("show")
        console.log('show')

        await sleep(sleepTime+2)
        setIsAskingQuestion(false)
        startLoadingBar(currentPlayTurn, 1)


        spawnPossibleAnswerAsteroids(scene, camera)
        const updateTimer = () => {
            setTimeout(async ()=>{
                const timeLeft =  getLiveTimeBeforeCollision()

                titleElement.innerHTML = `Collision in: T-minus ${timeLeft} seconds`
                if(timeLeft > 0) {
                    updateTimer()
                } else {
                    console.log('no show')
                    // if(getIsGamePlaying()) {
                        //     await sleep(duration+1)
                        // }
                        
                    // remove elements
                    titleElement.classList.remove("show")
                    questionElement.classList.remove("show")
                    // wait for the element's to dissapear before removing text
                    await sleep(2)
                    titleElement.innerHTML = ""
                    questionElement.innerHTML = ""
                }
            }, 500)
        }
        updateTimer(titleElement)
    }
}

const spawnPossibleAnswerAsteroids = (scene, camera) => {
    spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: answerTime, spawnNumber: 4})
    spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, cameraWillFollow:true, spawnNumber: 33})
    spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true, timeBeforeIntersection: 3, maxRandomOffsetMiss: 5, spawnNumber: 8})
}


const playTick = (elapsedTime, scene, camera) => {
    if(!windowHasFocus() && !spaceshipProps.spaceshipDestroyed){
        setIsGamePlaying(false)
        spaceshipProps.spaceshipDestroyed = false
        spaceshipRespawn(scene)
    }
    if(getIsGamePlaying()){
        const nextSpawn = getNextSpawn()
        if(nextSpawn!==null && nextSpawn < elapsedTime){
            const currentPlayTurn = getCurrentPlayTurn()
            setIsAskingQuestion(true)
            setTimeout((currentPlayTurn)=>{
                console.log(currentPlayTurn, getCurrentPlayTurn())
                if(currentPlayTurn===getCurrentPlayTurn()) {
                    startGameChallenge(currentPlayTurn, 1, scene, camera)
                    // end of current turn
                    setCurrentPlayTurn(currentPlayTurn+1)
                }
            }, 1*1000, currentPlayTurn)
            
            setNextSpawn(elapsedTime + spawnInterval)
            
        }
    }
} 


export {setupGame, playClicked, quitGame, setIsIntroSkipped, setIsTutSkipped, gameOver, playTick, getIsGamePlaying}
