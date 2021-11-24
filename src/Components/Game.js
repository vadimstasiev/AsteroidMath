import * as THREE from 'three'
import { Vector2, Vector3 } from 'three'

const playClicked = (scene, camera) => {
    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

    //temp
    let minRange = 0
    let maxRange = 0
    const cameraDirection = camera.getWorldDirection()
    const xzCameraDirection = new Vector3(cameraDirection.x, 1, cameraDirection.z)


    // calculate horizontal fov
    const hFOV = Math.abs(2 * Math.atan( Math.tan( camera.fov / 2 ) * camera.aspect )) 
    const spawnAngle = 0.3
    const spawnOffset =  (Math.PI/2)

    const max = 10
    const min = 6
    const amplitudeY = 4
    let x,y,z, theta, distanceToCamera
    const vec3 = new Vector3()
    const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z)
    var frustum = new THREE.Frustum()
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

    // for (let i = 0; i < 1000; i++) {
        const asteroid1 = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
        asteroid1.castShadow = true
        asteroid1.scale.set(1, 1, 1)


        // Find coordinates for a random point within the radius of 10 and outside the radius of 6

       
        // const cameraDirection = camera.getWorldDirection()
        
        let count = 0
        // max tries to find a random position that fits the requirements bellow
        let countMax = 200 

        do {
            const random = Math.random() *max 
            x = Math.sin(random) *max - ((Math.random()-0.5)*min)
            y = (Math.random()-0.5)* amplitudeY
            z = Math.cos(random) *max - ((Math.random()-0.5)*min)
            vec3.set(x,y,z)
            // console.log("1", vec3)
            const diff = vec3.clone().sub(cameraDirection)
            // console.log("2", vec3)
            // theta is the angle between where the camera is looking vs where the object is in relation to the camera.
            theta = Math.atan2(diff.x, diff.z) - cameraAngle
            distanceToCamera = Math.abs(vec3.distanceTo(camera.position))
            // console.log("theta: ", theta)

            // if(Math.abs(theta) < 3){
            //     if(theta < 0){
            //         //its to the right
            //     }
            //     else{
            //         //its to the left
            //     }
            // }
        // Check if position is outside camera view, TODO: it only accounts for the position of the object, mesh may still be inside
        // if theta smaller than 0 then the object is to the right of the camera, which is what we want
            count++
        } while(!( -spawnAngle - spawnOffset < theta && theta < spawnAngle - spawnOffset ) && count < countMax)
        maxRange =  theta>maxRange?theta:maxRange
        minRange =  theta<minRange?theta:minRange
        // console.log(theta)   

        // https://stackoverflow.com/questions/42215829/calculate-target-range-on-circle-three-js
        // https://stackoverflow.com/questions/29758233/three-js-check-if-object-is-still-in-view-of-the-camera
        if(count!==countMax){
            asteroid1.position.set(x, y, z)
            scene.add(asteroid1)
        }
    // }
    console.log(theta)
    console.log(cameraAngle)
    console.log(theta+cameraAngle)
    console.log(-spawnAngle + spawnOffset, spawnAngle + spawnOffset)
    // console.log("maxRange: ", maxRange)   
    // console.log("minRange: ", minRange)   
    // // TODO: add pi to camera to get maxRange/minRange value to compare to theta
    // console.log("hFOV*distanceToCamera: ", hFOV*distanceToCamera)
    // console.log("hFOV/distanceToCamera: ", hFOV/distanceToCamera)
    // console.log("distanceToCamera/hFOV: ", distanceToCamera/hFOV)
    // console.log("distanceToCamera: ", distanceToCamera)
    console.log("hFOV: ", hFOV)
    // console.log("theta: ", theta)
    // console.log("camera: ",Math.atan2(cameraDirection.x, cameraDirection.z))   
    // // console.log("-( cameraAngle + Math.PI): ", -( cameraAngle + Math.PI),"-( cameraAngle - Math.PI): ", -( cameraAngle - Math.PI), (-( cameraAngle - Math.PI) < theta && theta < -( cameraAngle + Math.PI)))
    // // console.log("-( cameraAngle + hFOV): ", -( cameraAngle + hFOV),"-( cameraAngle - hFOV): ", -( cameraAngle - hFOV), (-( cameraAngle + hFOV) < theta && theta < -( cameraAngle - hFOV)))
    // console.log(hFOV/2+theta)
    // // to check if object is in camera view: -hFOV < theta && theta < hFOV
}

export default playClicked
