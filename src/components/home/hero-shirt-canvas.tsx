"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { Group } from "three";

/** Soft white blank tee for the homepage hero. */
const PLAIN_TEE_HEX = "#f2f0eb";
const TEE_MAT = { color: PLAIN_TEE_HEX, roughness: 0.78, metalness: 0.03 };

/** Slightly softer procedural tee than studio primitives — still plain / blank. */
function PlainTeeMesh() {
  return (
    <group>
      {/* Torso */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.78, 1.02, 0.2]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      {/* Soft side panels for volume */}
      <mesh castShadow position={[-0.36, 0.1, 0]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[0.12, 0.96, 0.18]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      <mesh castShadow position={[0.36, 0.1, 0]} rotation={[0, 0, -0.04]}>
        <boxGeometry args={[0.12, 0.96, 0.18]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      {/* Neck / collar ring */}
      <mesh position={[0, 0.68, 0.02]}>
        <torusGeometry args={[0.13, 0.035, 12, 28]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 24]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      {/* Short sleeves */}
      <mesh position={[-0.52, 0.4, 0]} rotation={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[0.42, 0.24, 0.2]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      <mesh position={[0.52, 0.4, 0]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[0.42, 0.24, 0.2]} />
        <meshStandardMaterial {...TEE_MAT} />
      </mesh>
      {/* Hem */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.06, 0.21]} />
        <meshStandardMaterial color="#ebe8e2" roughness={0.82} metalness={0.02} />
      </mesh>
    </group>
  );
}

function RotatingPlainTee() {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.y = Math.sin(performance.now() * 0.0012) * 0.028;
  });

  return (
    <group ref={group} position={[0, 0.02, 0]}>
      <PlainTeeMesh />
    </group>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[2.8, 4.5, 2.2]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-2.5, 1.8, -1.5]} intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#9aa39c", 0.4]} />
      <RotatingPlainTee />
      <ContactShadows
        position={[0, -0.58, 0]}
        opacity={0.38}
        scale={5}
        blur={2.6}
        far={3}
      />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.15}
        minPolarAngle={Math.PI * 0.38}
        maxPolarAngle={Math.PI * 0.58}
        target={[0, 0.12, 0]}
      />
    </>
  );
}

export function HeroShirtCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [0.55, 0.28, 2.05], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        className="h-full w-full touch-none"
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
