"use client";

import * as THREE from "three";
import { memo, useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasState } from "../CanvasState";
import {
   Utils,
   Easing,
   useBeat,
   useCreateWobble3D,
} from "@/packages/use-shader-fx/src";
import { rewriteShader } from "./rewriteShader";
import { OnBeforeInitParameters } from "@/packages/use-shader-fx/src/fxs/types";
import { useVideoTexture } from "@react-three/drei";

// ステッカー部分以外のroughness
export const BASE_ROUGHNESS = 0.4;

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
                  uWaitingValue: { value: 0 },
                  uIsNotSticked: { value: true },
               });
               rewriteShader(shader);
            },
            [silhouetteMap]
         ),
      });

      updateWobble(null, {
         color0: new THREE.Color(0xb84f0a),
         color1: new THREE.Color(0xb84f0a),
         color2: new THREE.Color(0xb84f0a),
         color3: new THREE.Color(0xb84f0a),
         wobblePositionFrequency: 0.4,
         wobbleTimeFrequency: 0.4,
         warpPositionFrequency: 0,
         warpStrength: 0,
         warpTimeFrequency: 0,
      });

      const waitingMixVal = useRef(0);
      const wobbleVal = useRef(0);

      useFrame((state, delta) => {
         const { clock } = state;
         const { isNotSticked } = canvasState.stickerState;

         // isNotSticked stateの時にwaiting animationをloopする
         if (isNotSticked) {
            const tick = clock.getElapsedTime();
            waitingMixVal.current = Easing.easeOutQuad(
               Math.sin(tick * 3) * 0.5 + 0.5
            );
         } else {
            waitingMixVal.current = Utils.interpolate(
               waitingMixVal.current,
               0,
               0.1
            );
         }

         // ステッカーが押された時だけwobbleさせる
         if (canvasState.stickerState.wobbleStrength > 0) {
            canvasState.stickerState.wobbleStrength -= delta;
         }
         wobbleVal.current = Utils.interpolate(
            wobbleVal.current,
            canvasState.stickerState.wobbleStrength,
            0.24
         );

         updateWobble(
            state,
            {
               colorMix: waitingMixVal.current * 0.16,
               wobbleStrength: wobbleVal.current,
            },
            {
               uWaitingValue: waitingMixVal.current * 0.8,
               uIsNotSticked: isNotSticked,
            }
         );
      });

      return (
         <mesh
            onClick={(e) => {
               canvasState.setStickerState(e.uv!);
               canvasState.cameraState.point.set(e.point.x, e.point.y, 3.5);
            }}
            onPointerOver={() => (canvasState.cursorState.isOver = true)}
            onPointerOut={() => (canvasState.cursorState.isOver = false)}
            onPointerMove={(e) => {
               canvasState.cursorState.point.set(e.offsetX, e.offsetY);
            }}>
            <primitive object={wobble.mesh} />
         </mesh>
      );
   }
);

StickerBall.displayName = "StickerBall";
