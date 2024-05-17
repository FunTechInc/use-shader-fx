"use client";

import * as THREE from "three";
import { memo, useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasState } from "../CanvasState";
import { Utils, useCreateWobble3D } from "@/packages/use-shader-fx/src";
import { rewriteShader } from "./rewriteShader";
import { OnBeforeInitParameters } from "@/packages/use-shader-fx/src/fxs/types";
import { useMediaQuery } from "@funtech-inc/spice";

// ROUGHNESS other than sticker part
export const BASE_ROUGHNESS = 0.4;

// wobble strength when clicked
export const CLICKED_WOBBLE_STRENGTH = 0.4;

const FUNTECH_COLOR = new THREE.Color(0xb84f0a);

const StickerBallMesh = ({ children }: { children: React.ReactNode }) => {
   const canvasState = CanvasState.getInstance();
   const isDesktop = useMediaQuery({ type: "min", width: 960 });
   return (
      <mesh
         scale={isDesktop ? [1, 1, 1] : [0.72, 0.72, 0.72]}
         onClick={(e) => {
            canvasState.setStickerState(e.uv!);
            canvasState.cameraState.point.set(
               e.point.x,
               e.point.y,
               canvasState.CAMERA_Z.zoom
            );
            canvasState.cursorState.point.set(e.offsetX, e.offsetY);
         }}
         onPointerOver={() => (canvasState.cursorState.isOver = true)}
         onPointerOut={() => (canvasState.cursorState.isOver = false)}
         onPointerMove={(e) => {
            canvasState.cursorState.point.set(e.offsetX, e.offsetY);
         }}>
         {children}
      </mesh>
   );
};

export const StickerBall = memo(
   ({
      stickerMap,
      normalMap,
      silhouetteMap,
   }: {
      stickerMap: THREE.Texture;
      normalMap: THREE.Texture;
      silhouetteMap: THREE.Texture;
   }) => {
      const canvasState = CanvasState.getInstance();

      const [updateWobble, wobble] = useCreateWobble3D({
         geometry: new THREE.IcosahedronGeometry(2, 12),
         materialParameters: {
            map: stickerMap,
            normalMap: normalMap,
            roughness: 1,
            clearcoat: 1,
            iridescence: 1,
            metalness: 1,
            iridescenceIOR: 1,
            iridescenceThicknessRange: [0, 1400],
         },
         onBeforeInit: useCallback(
            (shader: OnBeforeInitParameters) => {
               Object.assign(shader.uniforms, {
                  uSilhouette: { value: silhouetteMap },
               });
               rewriteShader(shader);
            },
            [silhouetteMap]
         ),
      });

      updateWobble(null, {
         color0: FUNTECH_COLOR,
         color1: FUNTECH_COLOR,
         color2: FUNTECH_COLOR,
         color3: FUNTECH_COLOR,
         wobblePositionFrequency: 0.4,
         wobbleTimeFrequency: 0.4,
         warpPositionFrequency: 0,
         warpStrength: 0,
         warpTimeFrequency: 0,
      });

      const wobbleVal = useRef(0);

      useFrame((state, delta) => {
         // Only let them wobble when the sticker is pressed.
         if (canvasState.stickerState.wobbleStrength > 0) {
            canvasState.stickerState.wobbleStrength -= delta;
         } else {
            canvasState.stickerState.wobbleStrength = 0;
         }

         wobbleVal.current = Utils.interpolate(
            wobbleVal.current,
            canvasState.stickerState.wobbleStrength,
            0.24
         );

         updateWobble(state, {
            colorMix: canvasState.clockState.waiting * 0.24,
            wobbleStrength: wobbleVal.current,
         });
      });

      return (
         <StickerBallMesh>
            <primitive object={wobble.mesh} />
         </StickerBallMesh>
      );
   }
);

StickerBall.displayName = "StickerBall";
