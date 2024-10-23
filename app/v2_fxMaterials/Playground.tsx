"use client";

import { useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { NoiseMaterial } from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";

extend({ NoiseMaterial });

export const Playground = () => {
   const ref = useRef<any>();
   useFrame(({ clock }) => {
      ref.current.tick = clock.getElapsedTime();
   });
   const [funkun] = useTexture(["/funkun.jpg"]);
   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <noiseMaterial
               ref={ref}
               mixDst_src={funkun}
               mixDst_colorFactor={0.5}
               scale={0.01}
            />
         </mesh>
      </>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         noiseMaterial: any & JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
