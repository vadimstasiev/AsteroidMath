import React, { useRef, useState, useMemo } from 'react'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Text, useGLTF, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, SSAO, Bloom } from '@react-three/postprocessing'
import { KernelSize, BlendFunction } from 'postprocessing'
import { RectAreaLightUniformsLib, FlakesTexture } from 'three-stdlib'

import Model from "./Components/Model";
import LoadingScreen from './LoadingScreen'
import Overlay from './Overlay'

RectAreaLightUniformsLib.init()
THREE.Vector2.prototype.equals = function (v, epsilon = 0.001) {
  return Math.abs(v.x - this.x) < epsilon && Math.abs(v.y - this.y) < epsilon
}

const useLerpedMouse =()=> {
  const mouse = useThree((state) => state.mouse)
  const lerped = useRef(mouse.clone())
  const previous = new THREE.Vector2()
  useFrame((state) => {
    previous.copy(lerped.current)
    lerped.current.lerp(mouse, 0.1)
    // Regress system when the mouse is moved
    if (!previous.equals(lerped.current)) state.performance.regress()
  })
  return lerped
}

const YBot = (props) => {
  const ref = useRef()
  const [texture] = useState(() => new THREE.CanvasTexture(new FlakesTexture(), THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping))
  const { nodes, materials } = useGLTF('/untitled-draco2.glb')
  const mouse = useLerpedMouse()
  useFrame((state) => {
    ref.current.rotation.y = (mouse.current.x * Math.PI) / 10
    ref.current.rotation.x = (mouse.current.y * Math.PI) / 200
  })
  return (
    <group ref={ref} dispose={null} {...props}>
      <mesh castShadow receiveShadow geometry={nodes.Alpha_Surface.geometry}>
        <meshStandardMaterial
          metalness={0.4}
          roughness={0.2}
          color={materials.Alpha_Body_MAT.color}
          normalMap={texture}
          normalMap-repeat={[35, 35]}
          normalScale={[0.15, 0.15]}
        />
      </mesh>
      <mesh castShadow geometry={nodes.Alpha_Joints.geometry}>
        <meshStandardMaterial metalness={1} roughness={0.1} color={materials.Alpha_Joints_MAT.color} />
      </mesh>
    </group>
  )
}

const Lights = () => {
  const lights = useRef()
  const mouse = useLerpedMouse()
  useFrame((state) => {
    lights.current.rotation.x = (mouse.current.x * Math.PI) / 2
    lights.current.rotation.y = Math.PI * 0.25 - (mouse.current.y * Math.PI) / 2
  })
  return (
    <>
      <directionalLight intensity={1} position={[2, 2, 0]} color="red" distance={5} />
      <spotLight intensity={2} position={[-5, 10, 2]} angle={0.2} penumbra={1} castShadow shadow-mapSize={[2048, 2048]} />
      <group ref={lights}>
        <rectAreaLight intensity={2} position={[4.5, 0, -3]} width={10} height={10} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        <rectAreaLight intensity={2} position={[-10, 2, -10]} width={15} height={15} onUpdate={(self) => self.lookAt(0, 0, 0)} />
      </group>
    </>
  )
}

const Effects = () => {
  const ref = useRef()
  useFrame((state) => {
    // Disable SSAO on regress
    ref.current.blendMode.setBlendFunction(state.performance.current < 1 ? BlendFunction.SKIP : BlendFunction.MULTIPLY)
  }, [])
  return (
    <EffectComposer multisampling={8}>
      <SSAO ref={ref} intensity={15} radius={10} luminanceInfluence={0} bias={0.035} />
      <Bloom kernelSize={KernelSize.LARGE} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
    </EffectComposer>
  )
}

const Box = props => {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef()
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += 0.01))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const RecalcShadows = () => {
  const gl = useThree((state) => state.gl)
  useEffect(() => void (gl.shadowMap.needsUpdate = true), [])
  return null
}

const loadingManager = new THREE.LoadingManager(
  // Loaded
  () =>
  {
      // // Wait a little
      // (() =>
      // {
      //     // Animate overlay


      //     // Update loadingBarElement

      // }, 500)
      console.log('loading')

      // window.setTimeout(() =>
      // {
      //   console.log('loading')
      // }, 2000)
  },

  // // Progress
  // (itemUrl, itemsLoaded, itemsTotal) =>
  // {
  //     // Calculate the progress and update the loadingBarElement
  //     const progressRatio = itemsLoaded / itemsTotal
  //     loadingBarElement.style.transform = `scaleX(${progressRatio})`
  // }
)

const Game = props => {
    const [gltf, set] = useState()
    const overlay = useRef()
    const caption = useRef()
    const scroll = useRef(0)

    return (
      <>
        <Canvas
         shadows
         dpr={[1, 2]} 
         camera={{ position: [0, 0.5, 1], fov: 50, near: 0.001 }} 
         onCreated={(state) => {
           state.gl.shadowMap.autoUpdate = false
          //  state.events.connect(overlay.current)
         }}
         raycaster={{ computeOffsets: ({ clientX, clientY }) => ({ offsetX: clientX, offsetY: clientY }) }}
         >
          <ambientLight intensity={1} />
          <spotLight position={[1, 5, 3]} angle={0.2} penumbra={1} intensity={3} castShadow shadow-mapSize={[2048, 2048]} />
          <spotLight position={[0, 10, -10]} intensity={2} angle={0.04} penumbra={2} castShadow shadow-mapSize={[1024, 1024]} />
          <Suspense fallback={null}>
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
            <ContactShadows frames={1} rotation-x={[Math.PI / 2]} position={[0, -0.4, 0]} far={1} width={1.5} height={1.5} blur={3} />
            <Environment preset="night" />
            <RecalcShadows />
          </Suspense>
          <Model url='/models/DamagedHelmet.gltf' 
            loadingManager={loadingManager}
          />
          <OrbitControls zoomSpeed={1} autoRotate autoRotateSpeed={0.0} rotateSpeed={2} dampingFactor={0.5} minPolarAngle={-Math.PI / 2} maxPolarAngle={Math.PI / 1.7} makeDefault />
        </Canvas>
         <LoadingScreen/>
        {/* <Overlay ref={overlay} caption={caption} scroll={scroll} /> */}
      </>
    )
  }



// const Model = ({modelPath}) => {
//   const gltf = useLoader(GLTFLoader, modelPath, draco());
//   return gltf ? <primitive object={gltf.scene} /> : null;
// }

export default Game