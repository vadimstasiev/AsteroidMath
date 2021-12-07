import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint, sleep, getElapsedTime } from './Helpers'
import { spaceShipParams, cameraParams } from './Spaceship'
import { asteroidTick, spawnAsteroid } from './Asteroids'

let points = []

const setupSpaceshipOverlay = (scene) => {
    const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
    const overlayMaterial = new THREE.ShaderMaterial({
        transparent: true,
    })
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
    scene.add(overlay)
}

const spawnSpaceshipOverlay = (timeout, message, offset, position) => {
    const pointClassName = "point-" + points.length 
    const pointHTML =
        `<div class="point ${pointClassName}">\n` +
            `<div class="overlay-text">${message}</div>\n` +
        '</div>\n'


    document.getElementById('points-container').insertAdjacentHTML("afterbegin", pointHTML)

    points.push({
        element: document.querySelector(`.${pointClassName}`),
        timeout,
        offset,
        position
    })
}

const showMessages = async (isGamePlaying, messages, getElapsedTime, setMessageIsPlaying = (messageIsPlaying) => {}, playMessageContinue = () => false) => {
    setMessageIsPlaying(true)
    for (const msg of messages){
        if(isGamePlaying() && !playMessageContinue()){
            const {message, offsetX, offsetY, duration, wait} = msg
            spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY})
            await sleep(duration+wait)
        }
    } 
    setMessageIsPlaying(false)
}

const showDeathMessages = async (messages) => {
    const deathPosition = [...spaceShipParams.latestSpaceshipPosition]
    for (const msg of messages){
        const {message, offsetX, offsetY, duration, wait} = msg
        spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY}, deathPosition)
        await sleep(duration+wait)
    } 
}

const spaceshipOverlayTick = (elapsedTime, camera, sizes) => {
    // Go through each html point
    for(const point of points) {
        // Get 2D screen position
        const {element, timeout, offset, position} = point
        if(elapsedTime<timeout){
            let screenPositionVec3
            if(position){
                screenPositionVec3 = new Vector3(...position)
            } else {
                screenPositionVec3 = new Vector3(...spaceShipParams.latestSpaceshipPosition)
            }
            screenPositionVec3.project(camera)
            element.classList.add('visible')
            const translateX = screenPositionVec3.x * sizes.width * 0.5
            const translateY = - screenPositionVec3.y * sizes.height * 0.5
            element.style.transform = `translateX(${translateX+offset.x}px) translateY(${translateY+offset.y}px)`
        } else {
            element.remove()
        }
    }
}

export {setupSpaceshipOverlay, spawnSpaceshipOverlay, spaceshipOverlayTick, showMessages, showDeathMessages}