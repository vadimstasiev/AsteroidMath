import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint, sleep } from './Helpers'
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

const spawnSpaceshipOverlay = (timeout, message, offset) => {
    const pointClassName = "point-" + points.length 
    const pointHTML =
        `<div class="point ${pointClassName}">\n` +
            `<div class="overlay-text">${message}</div>\n` +
        '</div>\n'


    document.getElementById('points-container').insertAdjacentHTML("afterbegin", pointHTML)

    points.push({
        element: document.querySelector(`.${pointClassName}`),
        timeout,
        offset
    })
}

const showMessages = async (gameIsPlaying, messages, getElapsedTime, setMessageIsPlaying = (messageIsPlaying) => {}, playMessageContinue = () => false) => {
    setMessageIsPlaying(true)
    for (const msg of messages){
        if(gameIsPlaying && !playMessageContinue()){
            const {message, offsetX, offsetY, duration, wait} = msg
            spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY})
            await sleep(duration+wait)
        }
    } 
    setMessageIsPlaying(false)
}

const spaceshipOverlayTick = (elapsedTime, camera, sizes) => {
    // Go through each html point
    for(const point of points) {
        // Get 2D screen position
        const {element, timeout, offset} = point
        if(elapsedTime<timeout){
            const screenPosition = new Vector3(...spaceShipParams.latestSpaceshipPosition)
            screenPosition.project(camera)
            element.classList.add('visible')
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            element.style.transform = `translateX(${translateX+offset.x}px) translateY(${translateY+offset.y}px)`
        } else {
            element.remove()
        }
    }
}

export {setupSpaceshipOverlay, spawnSpaceshipOverlay, spaceshipOverlayTick, showMessages}