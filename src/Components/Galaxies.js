import * as THREE from 'three'
import generateGalaxy from './Galaxy'
import generateBgStars from './BackgroundStars'

let galaxy1
let galaxy2
let galaxy3
let galaxy4
let bgStarsG

const setupGalaxyScene = (scene) => {
    galaxy1 = new THREE.Group()
    scene.add(galaxy1)
    galaxy1.add(generateGalaxy({
        count : 100000,
        size : 0.003,
        radius : 10,
        branches : 5,
        spin : -1,
        randomness : 1.3,
        randomnessPower : 4,
        concentration : 0.5,
        insideColor : '#ff0018',
        outsideColor : '#1b3984',
    }))

    galaxy2 = new THREE.Group()
    scene.add(galaxy2)
    galaxy2.add(generateGalaxy({
        count: 10000,
        size: 0.005,
        radius: 7,
        branches: 2,
        spin: 1.2,
        randomness: 0.957,
        randomnessPower: 2.6,
        concentration: 0.23,
        insideColor: '#00e828',
        outsideColor: '#1b3984',
    }, new THREE.PointsMaterial({
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })))
    galaxy2.position.set(-30, 10, -20)
    galaxy2.rotation.x = Math.PI * 0.99


    galaxy3 = new THREE.Group()
    scene.add(galaxy3)
    galaxy3.add(generateGalaxy({
        count: 10000,
        size: 0.003,
        radius: 6.3,
        branches: 3,
        spin: -1,
        randomness: 1.3,
        randomnessPower: 4,
        concentration: 0.5,
        insideColor: '#e800a3',
        outsideColor: '#40841b',
    },
    new THREE.PointsMaterial({
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })))
    galaxy3.position.set(0, 10, 20)
    galaxy3.rotation.x = Math.PI * 0.9

    galaxy4 = new THREE.Group()
    scene.add(galaxy4)
    galaxy4.add(generateGalaxy({
        count : 10000,
        size : 0.010,
        radius : 20,
        branches : 6,
        spin : -0.6,
        randomness : 0.8,
        randomnessPower : 4.4,
        concentration : 0.15,
        insideColor : '#e80000',
        outsideColor : '#b9926d',
    }))

    galaxy4.position.set(6, -2, 3)
    galaxy4.rotation.x = Math.PI * 1.05


    bgStarsG = new THREE.Group()
    bgStarsG.add(generateBgStars({
        count : 7000,
        size : 0.01,
        width : 100,
    }))
    scene.add(bgStarsG)
}

const galaxiesTick = (elapsedTime) => {
    // Animate Galaxies

    const angle = elapsedTime * 0.5
    galaxy1.rotation.y = -0.01 * angle
    galaxy2.rotation.y = 0.03 * angle
    galaxy3.rotation.y = -0.01 * angle
    galaxy4.rotation.y = -0.005 * angle

    // Animate bgStars

    // bgStarsG.rotation.x = 0.01 * angle
    // bgStarsG.rotation.y = 0.01 * angle
}

export default setupGalaxyScene