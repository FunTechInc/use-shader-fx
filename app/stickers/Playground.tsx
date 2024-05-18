"use client";

import * as THREE from "three";
import { memo } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStickers } from "./useStickers";
import { CanvasState } from "./CanvasState";
import { StickerBall } from "./StickerBall";
import { Easing, Utils } from "@/packages/use-shader-fx/src";

const Background = memo(({ stickerMap }: { stickerMap: THREE.Texture }) => {
   return (
      <>
         <Environment preset="warehouse" environmentIntensity={0.5} />
         <mesh scale={100}>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial
               color={new THREE.Color(0x444444)}
               map={stickerMap}
               side={THREE.BackSide}
            />
         </mesh>
      </>
   );
});
Background.displayName = "Background";

export const Playground = () => {
   const { stickerMap, normalMap, isReady, silhouette } = useStickers();

   const canvasState = CanvasState.getInstance();

   useFrame(({ camera, clock }, delta) => {
      if (!isReady) {
         return;
      }

      // control camera state
      if (canvasState.cameraState.point.z < canvasState.CAMERA_Z.default) {
         canvasState.cameraState.point.z += delta;
      }
      camera.position.lerp(canvasState.cameraState.point, 0.16);
      camera.lookAt(0, 0, 0);

      // control clock state
      if (canvasState.stickerState.isNotSticked) {
         canvasState.clockState.waiting = Utils.interpolate(
            canvasState.clockState.waiting,
            Easing.easeOutSine(
               Math.sin(clock.getElapsedTime() * 3.5) * 0.5 + 0.5
            ),
            0.1
         );
      } else if (canvasState.clockState.waiting > 0) {
         canvasState.clockState.waiting = Utils.interpolate(
            canvasState.clockState.waiting,
            0,
            0.16
         );
      }
   });
   return (
      <mesh visible={isReady}>
         <StickerBall
            stickerMap={stickerMap}
            normalMap={normalMap}
            silhouetteMap={silhouette}
         />
         <Background stickerMap={stickerMap} />
         <OrbitControls
            enabled={true}
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.12}
            minAzimuthAngle={-0.785} // -45
            maxAzimuthAngle={0.785} // 45
            minPolarAngle={1.134} // 65
            maxPolarAngle={1.919} // 110
         />
      </mesh>
   );
};
