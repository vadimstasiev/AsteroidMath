import * as THREE from 'three'

const generateGalaxy = (parameters) =>
{
    /**
     * Geometry
     */

    const geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        // Position
        const i3 = i * 3

        const radius = Math.random() * parameters.radius

        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        
        const randomX = Math.random() * (Math.random() < 0.5 ? 1 : - 1) * (parameters.randomness / radius) /parameters.concentration
        const randomY = Math.random() * parameters.randomness * Math.cos((radius/parameters.radius)*parameters.randomnessPower/2) * Math.pow((radius/parameters.radius)*parameters.randomnessPower, Math.random()) * (Math.random() < 0.5 ? 1 : - 1)
        const randomZ = Math.random() * (Math.random() < 0.5 ? 1 : - 1) * (parameters.randomness / radius) /parameters.concentration

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Mixed Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)
        
        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
        if(radius>1){
            console.log('radius', radius)
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */


    const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    const points = new THREE.Points(geometry, material)
    return points
}

export default generateGalaxy