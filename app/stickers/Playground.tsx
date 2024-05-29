"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, createPortal, extend, useThree } from "@react-three/fiber";
import { useStickers } from "./StickerBall/useStickers";
import { CanvasState } from "./CanvasState";
import { StickerBall } from "./StickerBall";
import {
   Easing,
   Utils,
   useResizeBoundary,
   useSingleFBO,
} from "@/packages/use-shader-fx/src";
import { Background } from "./Background";
import { FxMaterial, FxMaterialProps } from "./romanticism/FxMaterial";
import { useRomanticism } from "./romanticism/useRomanticism";

extend({ FxMaterial });

export const Playground = () => {
   const { camera, size, viewport, gl } = useThree();

   const canvasState = CanvasState.getInstance();

   // 1000以上リサイズした場合のみリサイズする
   const resizeBoundary = useResizeBoundary({
      gl,
      size,
      boundFor: "larger",
      threshold: 1000,
   });

   // stickers
   const { stickerMap, normalMap, isReady, silhouette } =
      useStickers(resizeBoundary);

   // offscreen to stickers
   const offscreenScene = useMemo(() => new THREE.Scene(), []);
   const [portalStickers, updatePortalStickers] = useSingleFBO({
      scene: offscreenScene,
      camera,
      size,
      dpr: viewport.dpr,
      depthBuffer: true,
      isSizeUpdate: resizeBoundary.isUpdate,
   });

   // romanticism
   const romanticism = useRomanticism(portalStickers.texture);
   const materialRef = useRef<FxMaterialProps>(null);

   useFrame(({ camera, clock, pointer, gl }) => {
      if (!isReady) {
         return;
      }

      // update portalized stickers
      updatePortalStickers(gl);

      // update romanticism
      if (materialRef.current) {
         materialRef.current.u_time = clock.getElapsedTime();
      }

      // control camera state
      const _pointer = pointer.clone().multiplyScalar(0.32);
      canvasState.cameraState.point.lerp(
         {
            ..._pointer, // uncomment this line to enable camera movement
            // x: 0,
            // y: 0,
            z: canvasState.CAMERA_Z.default,
         },
         0.12
      );
      camera.position.lerp(canvasState.cameraState.point, 0.14);
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
      <>
         {createPortal(
            <mesh visible={isReady}>
               <StickerBall
                  stickerMap={stickerMap}
                  normalMap={normalMap}
                  silhouetteMap={silhouette}
               />
               <Background stickerMap={stickerMap} scene={offscreenScene} />
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
            </mesh>,
            offscreenScene
         )}
         <mesh visible={isReady}>
            <planeGeometry args={[2, 2]} />
            <fxMaterial
               ref={materialRef}
               u_romance={romanticism}
               u_original={portalStickers.texture}
               key={FxMaterial.key}
            />
         </mesh>
      </>
   );
};
