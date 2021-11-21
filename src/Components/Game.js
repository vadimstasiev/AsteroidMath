import * as THREE from 'three'
import { Vector3 } from 'three'

const playClicked = (scene, camera) => {
    const asteroidGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

    //temp
    let minRange = 0
    let maxRange = 0
    const cameraDirection = camera.getWorldDirection()


    for (let i = 0; i < 1000; i++) {
        const asteroid1 = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
        asteroid1.castShadow = true
        asteroid1.scale.set(1, 1, 1)


        // Find coordinates for a random point within the radius of 10 and outside the radius of 6

        const max = 10
        const min = 6
        const amplitudeY = 4
        let x,y,z, theta
        // const cameraDirection = camera.getWorldDirection()
        
        

        // do {
            const random = Math.random() *max 
            x = Math.sin(random) *max - ((Math.random()-0.5)*min)
            y = (Math.random()-0.5)* amplitudeY
            z = Math.cos(random) *max - ((Math.random()-0.5)*min)
            const vec3 = new Vector3(x,y,z)
            const diff = vec3.sub(cameraDirection)
            // theta is the angle between where the camera is looking vs where the object is in relation to the camera.
            theta = Math.atan2(diff.x, diff.z) - Math.atan2(cameraDirection.x, cameraDirection.z)

            // if(abs(theta) < 3){
            //     if(theta < 0){
            //         //its to the right
            //     }
            //     else{
            //         //its to the left
            //     }
            // }
        // } while(Math.abs(theta) > Math.PI)
        maxRange =  theta>maxRange?theta:maxRange
        minRange =  theta<minRange?theta:minRange
        // console.log(theta)   

        // https://stackoverflow.com/questions/42215829/calculate-target-range-on-circle-three-js
        asteroid1.position.set(x, y, z)
        scene.add(asteroid1)
    }
    console.log("maxRange: ", maxRange)   
    console.log("minRange: ", minRange)   
    console.log("camera: ",Math.atan2(cameraDirection.x, cameraDirection.z))   

}

export default playClicked
