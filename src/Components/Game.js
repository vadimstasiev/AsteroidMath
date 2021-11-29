import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from 'three'
import { rotateAboutPoint } from './Helpers'
import { spaceShipParams } from './Spaceship'
import { spawnAsteroid } from './Asteroids'



const playClicked = (elapsedTime, scene, camera) => {
    const willHit = true
    spawnAsteroid(elapsedTime, scene, camera, willHit)
    for (let i = 0; i < 10  ; i++) {
        spawnAsteroid(elapsedTime, scene, camera)
    }
}

export {playClicked}
