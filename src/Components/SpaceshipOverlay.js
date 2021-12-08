import * as THREE from 'three'
import { Vector3 } from 'three'
import { sleep, getElapsedTime } from './Helpers'
import { spaceshipProps } from './Spaceship'

let points = []

const setupSpaceshipOverlay = (scene) => {
    const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
    const overlayMaterial = new THREE.ShaderMaterial({
        transparent: true,
    })
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
    scene.add(overlay)
}

const spawnSpaceshipOverlay = (timeout, message, offset, tag="", position) => {
    const pointClassName = "message-" + points.length 
    const pointHTML =
        `<div class="point ${pointClassName} ${tag}">\n` +
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

const showMessages = async (getIsGamePlaying, messages, getElapsedTime, setMessageIsPlaying = (messageIsPlaying) => {}, getUserHasSkipped = () => false, tag="") => {
    setMessageIsPlaying(true)
    for (const msg of messages){
        if(getIsGamePlaying() && !getUserHasSkipped()){
            const {message, offsetX, offsetY, duration, wait} = msg
            spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY}, tag)
            await sleep(duration+wait)
        }
    } 
    setMessageIsPlaying(false)
}

const showDeathMessages = async (messages) => {
    const deathPosition = [...spaceshipProps.latestSpaceshipPosition]
    for (const msg of messages){
        const {message, offsetX, offsetY, duration, wait} = msg
        spawnSpaceshipOverlay(getElapsedTime()+duration, message, {x: offsetX, y: offsetY}, "death", deathPosition)
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
                screenPositionVec3 = new Vector3(...spaceshipProps.latestSpaceshipPosition)
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