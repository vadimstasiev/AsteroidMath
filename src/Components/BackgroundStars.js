// This galaxy generator was based off of this source: https://github.com/the-halfbloodprince/GalaxyM1199
import * as THREE from 'three'

const materialDefault = new THREE.PointsMaterial({
    sizeAttenuation: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
})


const generateBgStars = (parameters, geometry = new THREE.BufferGeometry(), material = materialDefault) => {
    material.size = parameters.size

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        // Position
        const i3 = i * 3

        positions[i3    ] = (Math.random() - 0.5) * parameters.width
        positions[i3 + 1] = (Math.random() - 0.5) * parameters.width
        positions[i3 + 2] = (Math.random() - 0.5) * parameters.width

        // Mixed Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, Math.random())
        
        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Points
     */
    const points = new THREE.Points(geometry, material)
    return points
}

export default generateBgStars