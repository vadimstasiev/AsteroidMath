import React, { useState, useMemo } from 'react'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

const Model = props => {
    const [gltf, set] = useState()
    useMemo(() => new GLTFLoader(props.loadingManager).load(props.url, set), [props.url])

    return gltf ? <primitive object={gltf.scene} /> : null

  }


export default Model