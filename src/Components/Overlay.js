import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraTrajectoryParams } from './Spaceship'
import { asteroidTick, spawnAsteroid } from './Asteroids'

let points = []

const setupPointsOverlay = (scene) => {
    const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
    const overlayMaterial = new THREE.ShaderMaterial({
        transparent: true,
    })
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
    scene.add(overlay)
}


const spawnOverlay = (asteroidObj) => {
    const pointClassName = "point-" + points.length 


    const pointHTML =
        `<div class="point ${pointClassName}">\n` +
            `<div class="label">${points.length}</div>\n` +
        '</div>\n'

    document.getElementById('points-container').insertAdjacentHTML("beforeend", pointHTML)

    points.push({
        asteroid: asteroidObj,
        element: document.querySelector(`.${pointClassName}`)
    })

}

const removeOverlay = (asteroidObj) => {
    for(const i in points) {
        const {asteroid, element} = points[i]
        if(asteroid===asteroidObj){
            points.splice(i, 1)
            element.remove()
        }
    }
    console.log(points)
}

const overlayTick = (camera, sizes) => {
    // Go through each html point
    for(const point of points) {
        // Get 2D screen position
        const screenPosition = point.asteroid.position.clone()
        screenPosition.project(camera)
        point.element.classList.add('visible')
        const translateX = screenPosition.x * sizes.width * 0.5
        const translateY = - screenPosition.y * sizes.height * 0.5
        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    }
}

export {setupPointsOverlay, spawnOverlay, removeOverlay, overlayTick}