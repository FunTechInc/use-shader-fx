"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
   useFrame,
   useThree,
   extend,
   useLoader,
   createPortal,
} from "@react-three/fiber";
import {
   useNoise,
   useFluid,
   useCoverTexture,
   useRawBlank,
   useBlur,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import {
   Environment,
   Float,
   OrbitControls,
   useVideoTexture,
} from "@react-three/drei";
import { useSingleFBO } from "@/packages/use-shader-fx/legacy";

/*===============================================
TODO * これをFxRendererで、描画できるようにする
glslのカスマイズなしで、レンダリングするのを目標とする
===============================================*/

extend({ FxMaterial });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const offscreenScene = useMemo(() => new THREE.Scene(), []);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene: offscreenScene,
      camera,
      size,
      dpr: viewport.dpr,
      depthBuffer: true,
   });

   const blur = useBlur({
      size,
      dpr: 1,
      src: renderTarget.texture,
   });

   const noise = useNoise({
      size,
      dpr: 0.05,
      scale: 0.03,
   });

   useFrame((state) => {
      blur.render(state);
      noise.render(state);
      updateRenderTarget(state.gl);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial
               u_fx={blur.texture}
               u_noise={noise.texture}
               key={FxMaterial.key}
            />
         </mesh>
         {createPortal(
            <Float rotationIntensity={2} floatIntensity={2} speed={2}>
               <mesh scale={0.8}>
                  <torusKnotGeometry args={[2, 0.5, 400, 32]} />
                  <ambientLight intensity={2} />
                  <directionalLight intensity={2} />
                  <meshStandardMaterial />
               </mesh>
               <OrbitControls />
            </Float>,
            offscreenScene
         )}
      </>
   );
};
