"use client";

import * as THREE from "three";
import { useRef, useState } from "react";
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
   useSingleFBO,
   createFxMaterial,
   createFxBasixFxMaterial,
} from "@/packages/use-shader-fx/src";
// import { FxMaterial } from "./FxMaterial";
import {
   Environment,
   Float,
   OrbitControls,
   useVideoTexture,
} from "@react-three/drei";

const FxMaterial = createFxMaterial();
const FxBasicFxMaterial = createFxBasixFxMaterial();

extend({ FxMaterial, FxBasicFxMaterial });

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
         fxBasicFxMaterial: any;
      }
   }
}

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [offscreenScene] = useState(() => new THREE.Scene());

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
      updateRenderTarget({ gl: state.gl });
      noise.render(state);
      blur.render(state);
   });

   const ref = useRef<any>();
   useFrame(() => {
      // ref.current.updateBasicFx();
   });
   // console.log(ref.current.updateResolution);

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxBasicFxMaterial
               ref={ref}
               src={blur.texture}
               mixSrc={noise.texture}
               mixSrcUvFactor={0.4}
               mixDstUvFactor={0.5}
               mixDstAlphaFactor={0.5}
               // u_fx={blur.texture}
               // u_noise={noise.texture}
               // key={FxMaterial.key}
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
