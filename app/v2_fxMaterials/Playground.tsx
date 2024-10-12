"use client";

import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   NoiseMaterial,
   NoiseValues,
   FxMaterialImplValues,
   FxBasicFxMaterialImplValues,
} from "@/packages/use-shader-fx/src";

extend({ NoiseMaterial });

export const Playground = () => {
   const ref = useRef<any>();
   useFrame(({ clock }) => {
      ref.current.tick = clock.getElapsedTime();
   });
   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <noiseMaterial ref={ref} scale={0.01} tick={2} />
         </mesh>
      </>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         noiseMaterial: NoiseValues & JSX.IntrinsicElements["shaderMaterial"];
         fxMaterialImpl: FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
         fxBasicFxMaterialImpl: FxBasicFxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
