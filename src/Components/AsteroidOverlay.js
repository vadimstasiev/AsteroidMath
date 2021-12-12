import {PlaneBufferGeometry, ShaderMaterial, Mesh, Frustum, Matrix4} from 'three'

let points = []

const setupPointsOverlay = (scene) => {
    const overlayGeometry = new PlaneBufferGeometry(2, 2, 1, 1)
    const overlayMaterial = new ShaderMaterial({
        transparent: true,
    })
    const overlay = new Mesh(overlayGeometry, overlayMaterial)
    scene.add(overlay)
}


const spawnPointOverlay = (asteroid, displayNumber, clickablePlaneIndex) => {
    const pointClassName = "point-" + points.length 



    const pointHTML =
        `<div class="point ${pointClassName} unselectable" onclick='window.markAsteroidClicked(${clickablePlaneIndex})'>\n` +
            `<div class="label">${displayNumber}</div>\n` +
        '</div>\n'

    document.getElementById('points-container').insertAdjacentHTML("beforeend", pointHTML)

    points.push({
        asteroid: asteroid,
        element: document.querySelector(`.${pointClassName}`)
    })
}

const removePointOverlay = asteroid => points.filter(point => {
    if (point.asteroid === asteroid) {
        point.element.remove()
    } else {
        return point
    }
})


var frustum = new Frustum();
const pointOverlayTick = (camera, sizes) => {
    frustum.setFromProjectionMatrix(new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
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
