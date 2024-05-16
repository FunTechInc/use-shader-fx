"use client";

import * as THREE from "three";
import { memo } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStickers } from "./useStickers";
import { CanvasState } from "./CanvasState";
import { StickerBall } from "./StickerBall";

const Background = memo(({ stickerMap }: { stickerMap: THREE.Texture }) => {
   return (
      <>
         <Environment preset="warehouse" environmentIntensity={0.5} />
         <mesh scale={100}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshBasicMaterial
               color={new THREE.Color(0x333333)}
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

   useFrame(({ camera }, delta) => {
      if (!isReady) {
         return;
      }
      if (canvasState.cameraState.point.z < 4) {
         canvasState.cameraState.point.z += delta;
      }
      camera.position.lerp(canvasState.cameraState.point, 0.16);
      camera.lookAt(0, 0, 0);
   });
   return (
      <mesh visible={isReady}>
         <StickerBall
            stickerMap={stickerMap}
            normalMap={normalMap}
            silhouetteMap={silhouette}
         />
         <Background stickerMap={stickerMap} />
         {/* <OrbitControls /> */}
      </mesh>
   );
};
