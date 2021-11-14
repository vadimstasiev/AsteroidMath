// This generator was based off of this source: https://github.com/the-halfbloodprince/GalaxyM1199
import * as THREE from 'three'

const materialDefault = new THREE.PointsMaterial({
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
})

//Background stars
const generateBgStars = (parameters, geometry = new THREE.BufferGeometry(), material = materialDefault) => {
    const positions = new Float32Array(parameters.count * 3)
    material.size = parameters.size
    material.color = parameters.color

    for(let i = 0; i<parameters.count; i++){
        const i3 = i * 3
        positions[i3 + 0] = (Math.random() - 0.5)*20
        positions[i3 + 1] = (Math.random() - 0.5)*20
        positions[i3 + 2] = (Math.random() - 0.5)*20
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const bgStars = new THREE.Points(geometry, material)

    return bgStars
}

export default generateBgStars