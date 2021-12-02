import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams, cameraParams } from './Spaceship'
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


const spawnPointOverlay = (asteroidObj) => {
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

const removePointOverlay = (asteroidObj) => {
    for(const i in points) {
        const {asteroid, element} = points[i]
        if(asteroid===asteroidObj){
            element.remove()
        }
    }
    console.log(points)
}

var frustum = new THREE.Frustum();
const pointOverlayTick = (camera, sizes) => {
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    // Go through each html point
    for(const point of points) {
        // Ensure that a point is not rendered if it is behind the camera 
        if(frustum.containsPoint(point.asteroid.position)){
            // Get 2D screen position
            const screenPosition = point.asteroid.position.clone()
            screenPosition.project(camera)
            point.element.classList.add('visible')
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        } else {
            point.element.classList.remove('visible')
        }
        
    }
}

export {setupPointsOverlay, spawnPointOverlay, removePointOverlay, pointOverlayTick}
