import React, { useRef, useState } from 'react'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'

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

function RecalcShadows() {
  const gl = useThree((state) => state.gl)
  useEffect(() => void (gl.shadowMap.needsUpdate = true), [])
  return null
}

const Game = props => {
    return (
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.5, 1], fov: 50, near: 0.001 }} onCreated={(state) => (state.gl.shadowMap.autoUpdate = false)}>
        <ambientLight intensity={4} />
        <spotLight position={[1, 5, 3]} angle={0.2} penumbra={1} intensity={3} castShadow shadow-mapSize={[2048, 2048]} />
        <spotLight position={[0, 10, -10]} intensity={2} angle={0.04} penumbra={2} castShadow shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={null}>
          <Box position={[-1.2, 0, 0]} />
          <Box position={[1.2, 0, 0]} />
          {/* <Model frames={1} limit={50} position={[0, -0.0005, 0]} castShadow receiveShadow /> */}
          <ContactShadows frames={1} rotation-x={[Math.PI / 2]} position={[0, -0.4, 0]} far={1} width={1.5} height={1.5} blur={3} />
          <Environment preset="night" />
          <RecalcShadows />
        </Suspense>
        <OrbitControls zoomSpeed={0.1} autoRotate autoRotateSpeed={0.0} rotateSpeed={2} dampingFactor={0.5} minPolarAngle={-Math.PI / 2} maxPolarAngle={Math.PI / 1.7} makeDefault />
      </Canvas>
    )
  }
export default Game