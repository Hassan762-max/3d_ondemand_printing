"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { GarmentMesh } from "@/components/studio/garment-mesh";
import {
  selectActiveDesign,
  selectActiveProduct,
  useStudioStore,
} from "@/lib/studio/store";
import type { CameraPreset } from "@/lib/studio/types";

const PRESET_POS: Record<Exclude<CameraPreset, "free">, [number, number, number]> = {
  front: [0, 0.2, 2.4],
  back: [0, 0.2, -2.4],
  left: [-2.4, 0.25, 0],
  right: [2.4, 0.25, 0],
};

function CameraRig() {
  const preset = useStudioStore((s) => s.cameraPreset);
  const controls = useRef<{
    target: { set: (x: number, y: number, z: number) => void };
    update: () => void;
  } | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (preset === "free") return;
    const pos = PRESET_POS[preset];
    camera.position.set(...pos);
    camera.lookAt(0, 0.2, 0);
    controls.current?.target.set(0, 0.2, 0);
    controls.current?.update();
  }, [preset, camera]);

  return (
    <OrbitControls
      ref={controls as never}
      enablePan={false}
      minDistance={1.4}
      maxDistance={4.2}
      maxPolarAngle={Math.PI * 0.82}
      target={[0, 0.2, 0]}
      onStart={() => useStudioStore.getState().setCameraPreset("free")}
    />
  );
}

function SceneContent() {
  const product = useStudioStore(selectActiveProduct);
  const design = useStudioStore(selectActiveDesign);
  const colorHex = useStudioStore((s) => s.colorHex);
  const placement = useStudioStore((s) => s.placement);
  const side = useStudioStore((s) => s.side);

  if (!product) return null;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <GarmentMesh
        category={product.category}
        color={colorHex}
        designUrl={design?.imageUrl ?? null}
        placement={placement}
        side={side}
      />
      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.45}
        scale={6}
        blur={2.4}
        far={3}
      />
      <Environment preset="city" />
      <CameraRig />
    </>
  );
}

export function StudioCanvas() {
  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#1a1f28_0%,#0e1116_55%,#152019_100%)]">
      <Canvas
        shadows
        camera={{ position: [0, 0.25, 2.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">
          Drag to orbit · scroll to zoom
        </p>
      </div>
    </div>
  );
}
