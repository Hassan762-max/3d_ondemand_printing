"use client";

import { DesignDecal } from "@/components/studio/design-decal";
import type { Placement, StudioSide } from "@/lib/studio/types";

function TeeBody({ color }: { color: string }) {
  return (
    <group>
      {/* Torso */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.72, 0.95, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.12, 24]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Sleeves */}
      <mesh position={[-0.5, 0.42, 0]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.38, 0.22, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0.5, 0.42, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.38, 0.22, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
    </group>
  );
}

function HoodieBody({ color }: { color: string }) {
  return (
    <group>
      <TeeBody color={color} />
      <mesh position={[0, 0.82, -0.02]}>
        <sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.05, 0.13]}>
        <boxGeometry args={[0.34, 0.28, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
      </mesh>
    </group>
  );
}

function CapBody({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.38, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.02, 0.28]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.04, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} />
      </mesh>
    </group>
  );
}

function PoloBody({ color }: { color: string }) {
  return (
    <group>
      <TeeBody color={color} />
      <mesh position={[0, 0.62, 0.12]}>
        <boxGeometry args={[0.16, 0.08, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.06} />
      </mesh>
    </group>
  );
}

function CasualShirtBody({ color }: { color: string }) {
  return (
    <group>
      <TeeBody color={color} />
      {/* Collar */}
      <mesh position={[0, 0.66, 0.1]}>
        <boxGeometry args={[0.28, 0.06, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
      </mesh>
    </group>
  );
}

function JacketBody({ color }: { color: string }) {
  return (
    <group>
      {/* Torso */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.74, 0.98, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 0.7, 0.08]}>
        <boxGeometry args={[0.3, 0.08, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Longer sleeves */}
      <mesh position={[-0.52, 0.28, 0]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.48, 0.2, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0.52, 0.28, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.48, 0.2, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
    </group>
  );
}

function JoggersBody({ color }: { color: string }) {
  return (
    <group>
      {/* Waist / hips */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.68, 0.42, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.18, -0.35, 0]} castShadow>
        <boxGeometry args={[0.26, 0.88, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.18, -0.35, 0]} castShadow>
        <boxGeometry args={[0.26, 0.88, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
    </group>
  );
}

function ShortsBody({ color }: { color: string }) {
  return (
    <group>
      {/* Waist / hips */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.68, 0.42, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.18, 0.02, 0]} castShadow>
        <boxGeometry args={[0.26, 0.38, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.18, 0.02, 0]} castShadow>
        <boxGeometry args={[0.26, 0.38, 0.24]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.04} />
      </mesh>
    </group>
  );
}

export function GarmentMesh({
  category,
  color,
  designUrl,
  placement,
  side,
}: {
  category: string;
  color: string;
  designUrl: string | null;
  placement: Placement;
  side: StudioSide;
}) {
  const body =
    category === "JACKET" ? (
      <JacketBody color={color} />
    ) : category === "JOGGERS" ? (
      <JoggersBody color={color} />
    ) : category === "SHORTS" ? (
      <ShortsBody color={color} />
    ) : category === "CASUAL_SHIRT" ? (
      <CasualShirtBody color={color} />
    ) : category === "HOODIE" || category === "SWEATSHIRT" ? (
      <HoodieBody color={color} />
    ) : category === "CAP" ? (
      <CapBody color={color} />
    ) : category === "POLO" ? (
      <PoloBody color={color} />
    ) : (
      <TeeBody color={color} />
    );

  return (
    <group>
      {body}
      {designUrl ? (
        <DesignDecal imageUrl={designUrl} placement={placement} side={side} />
      ) : null}
    </group>
  );
}
