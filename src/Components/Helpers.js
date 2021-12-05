import * as THREE from 'three'


//// source: https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733
// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
const rotateAboutPoint = (obj, point, axis, theta, pointIsWorld) => {
    pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld

    if(pointIsWorld){
        obj.parent.localToWorld(obj.position) // compensate for world coordinate
    }

    obj.position.sub(point) // remove the offset
    obj.position.applyAxisAngle(axis, theta) // rotate the POSITION
    obj.position.add(point) // re-add the offset

    if(pointIsWorld){
        obj.parent.worldToLocal(obj.position) // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta) // rotate the OBJECT
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomArbitrary = (min, max) => {
    return Math.random() * (max - min) + min
}

const sleep = (s) => {
    return new Promise(resolve => setTimeout(resolve, s*1000))
}

let gameElapsedTime = 0
const getElapsedTime = () => gameElapsedTime

const elapsedTimeTick = (elapsedTime) => {
    gameElapsedTime = elapsedTime
}

export {rotateAboutPoint, getRandomInt, getRandomArbitrary, sleep, getElapsedTime, elapsedTimeTick}
