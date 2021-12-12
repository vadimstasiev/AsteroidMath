import gsap from 'gsap'
import { getElapsedTime, getterSetter } from './Helpers'
import { spaceshipProps, cameraProps, spaceshipRespawn, spaceshipG } from './Spaceship'
import { doesAsteroidArrayHaveCurrentWillHit, getLiveTimeBeforeCollision, spawnAsteroid } from './Asteroids'
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
        if(getIsGamePlaying()){
            // show /hide mobile login singup toggle 
            for(const element of document.getElementsByClassName('navbar-toggler')){
                element.classList.remove("show")
                element.setAttribute('data-toggle', '')
            }
        } else {
            // show /hide mobile login singup toggle 
            for(const element of document.getElementsByClassName('navbar-toggler')){
                element.classList.add("show")
                element.setAttribute('data-toggle', 'collapse')
            }
        }

        if(getIsGamePlaying() || spaceshipProps.spaceshipDestroyed){
            // hide
            for(const element of document.getElementsByClassName('play-and-leaderboard')){
                element.style.display = 'none'
            }
            // show
            for(const element of document.getElementsByClassName('score-skip-quit')){
                element.style.display = 'flex'
            }
        } else {
            // show
            for(const element of document.getElementsByClassName('play-and-leaderboard')){
                element.style.display = ''
            }
            // hide
            for(const element of document.getElementsByClassName('score-skip-quit')){
                element.style.display = 'none'
            }
        }
        
        if(getIsGamePlaying()){        
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
            for(const element of document.getElementsByClassName('quit')){
                element.style.display = ''
            }
        }
        const aspectRatio = window.innerHeight/window.innerWidth
        if(getIsIntroPlaying() || getIsTutPlaying()) {
            // when either of the introductory messages are playing 
            gsap.to(cameraProps,  {
                duration: 2,
                // manually set values back to default, (check Spaceship.js for default values)
                cameraDummyPointOffset: 0,
                cameraToSpaceshipOffset: 0.4,
                cameraRadiusMultiplier: 0.7,
            })
        } else if(getIsAskingQuestion()) {
            // period during which question is being asked 
            gsap.to(cameraProps,  {
                duration: 2,
                // manually set values back to default, (check Spaceship.js for default values)
                cameraDummyPointOffset: aspectRatio>1?0:0.5,
                cameraToSpaceshipOffset: aspectRatio>1?1:0.4,
                cameraRadiusMultiplier: aspectRatio>1?0.3:0.7,
                // cameraRadiusMultiplier: 0.4,
            })
        } else if(spaceshipProps.spaceshipDestroyed && aspectRatio>1) {
            // when game is not playing
            gsap.to(cameraProps,  {
                duration: 2,
                cameraDummyPointOffset: -8,
                cameraToSpaceshipOffset: 0,
                cameraRadiusMultiplier: 0.4,
            })
        } else if(!getIsGamePlaying()) {
            // when game is not playing
            gsap.to(cameraProps,  {
                duration: 2,
                cameraDummyPointOffset: 0,
                cameraToSpaceshipOffset: 0.4,
                cameraRadiusMultiplier: 0.7,
            })
        } else  {
            // e.g. when game is playing and is not doing any of the above
            // Move camera further away for better visibility
            gsap.to(cameraProps,  {
                duration: 2,
                cameraToSpaceshipOffset: 1.5,
                cameraDummyPointOffset: aspectRatio>1?0:1,
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
    setIsGamePlaying(false)
    showDeathMessages([deathMessages[getRandomInt(0,deathMessages.length-1)]], getElapsedTime)
    await spaceshipRespawn(scene, spaceshipProps.timeBeforeRespawn)
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
        const wrongAnswerSameSign = (answer>=0?Math.abs(wrongAnswer):-Math.abs(wrongAnswer))
        return wrongAnswerSameSign!==answer?wrongAnswerSameSign:getWrongAnswer(minOffset, maxOffset)
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
        questionElement.innerHTML = question.question + ' ='

        questionElement.classList.add("show")

        const resetTitleAndQuestionElements = async () => {
            // remove elements
            titleElement.classList.remove("show")
            questionElement.classList.remove("show")
            // wait for the element's to dissapear before removing text
            await sleep(2)
            titleElement.innerHTML = ""
            questionElement.innerHTML = ""
        }

        await sleep(sleepTime)
        if(getIsGamePlaying()){ 
            setIsAskingQuestion(false)
            startLoadingBar(currentPlayTurn, 1)
            spawnPossibleAnswerAsteroids(scene, camera, question)
        }

        const updateTimer = () => {
            setTimeout(async ()=>{
                if(getIsGamePlaying()){
                    const timeLeft =  getLiveTimeBeforeCollision()
                    titleElement.innerHTML = `Collision in: ${timeLeft} seconds`
                    if(timeLeft > 0) {
                        updateTimer()
                    } else {
                        await resetTitleAndQuestionElements()
                        // setCurrentPlayTurn(currentPlayTurn+1)
                    }
                } else {
                    await resetTitleAndQuestionElements()
                }
            }, 500)
        }
        updateTimer(titleElement)
    }
}

const spawnPossibleAnswerAsteroids = (scene, camera, question) => {
    const {answer, getWrongAnswer} = question
    spawnAsteroid(getElapsedTime(), scene, camera, { willHit: true, hasOverlay: true, timeBeforeIntersection: answerTime, spawnNumber: answer})
    spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: answerTime, maxRandomOffsetMiss: 5, spawnNumber: getWrongAnswer()})
    spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: answerTime+1, maxRandomOffsetMiss: 5, spawnNumber: getWrongAnswer()})
    spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: answerTime+2, maxRandomOffsetMiss: 5, spawnNumber: getWrongAnswer()})
    spawnAsteroid(getElapsedTime(), scene, camera, { hasOverlay: true,  timeBeforeIntersection: answerTime-1, maxRandomOffsetMiss: 5, spawnNumber: getWrongAnswer()})
    spawnAsteroid(getElapsedTime(), scene, camera, { timeBeforeIntersection: answerTime, onlyForCameraToFollow:true, minSpawnRange:15, maxSpawnRange:15, maxAmplitudeYRange:0, })
}


const playTick = (elapsedTime, scene, camera) => {
    // if(!windowHasFocus()){
    //     quitGame()
    //     spaceshipRespawn(scene, 1)
    // }
    if(getIsGamePlaying()){
        const nextSpawn = getNextSpawn()
        if(nextSpawn!==null && nextSpawn < elapsedTime){
            const currentPlayTurn = getCurrentPlayTurn()
            setIsAskingQuestion(true)
            setTimeout((currentPlayTurn)=>{
                if(currentPlayTurn===getCurrentPlayTurn()) {
                    startGameChallenge(currentPlayTurn, 3, scene, camera)
                    // end of current turn
                }
            }, 1*1000, currentPlayTurn)
            
            setNextSpawn(elapsedTime + spawnInterval)
            
        }
    }
} 


export {setupGame, playClicked, quitGame, setIsIntroSkipped, setIsTutSkipped, gameOver, playTick, getIsGamePlaying, windowHasFocus}
