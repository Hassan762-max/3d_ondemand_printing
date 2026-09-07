"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import type { Placement, StudioSide } from "@/lib/studio/types";

function mapPlacement(placement: Placement, side: StudioSide) {
  const x = (placement.x - 0.5) * 0.55;
  const y = 0.55 - placement.y * 0.85;
  const z = side === "front" ? 0.135 : -0.135;
  const rotY = side === "front" ? 0 : Math.PI;
  const rotZ = THREE.MathUtils.degToRad(placement.rotation);
  const s = 0.22 * placement.scale;
  return { x, y, z, rotY, rotZ, s };
}

export function DesignDecal({
  imageUrl,
  placement,
  side,
}: {
  imageUrl: string;
  placement: Placement;
  side: StudioSide;
}) {
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mapped = useMemo(
    () => mapPlacement(placement, side),
    [placement, side],
  );

  return (
    <mesh
      position={[mapped.x, mapped.y, mapped.z]}
      rotation={[0, mapped.rotY, mapped.rotZ]}
      renderOrder={2}
    >
      <planeGeometry args={[mapped.s, mapped.s]} />
      <meshStandardMaterial
        map={texture}
        transparent
        roughness={0.55}
        metalness={0.05}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
