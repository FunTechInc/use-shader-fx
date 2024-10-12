"use client";

import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   useNoise,
   NoiseValues,
   useBlur,
   useSingleFBO,
   createFxMaterialImpl,
   createFxBasicFxMaterialImpl,
   FxMaterialImplValues,
   FxBasicFxMaterialImplValues,
   useFluid,
} from "@/packages/use-shader-fx/src";
import { Float, OrbitControls } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;
	void main() {
		vec2 vel = texture2D(src, vUv).xy;
		float len = length(vel);
		vel = vel * 0.5 + 0.5;
		
		vec3 color = vec3(vel.x, vel.y, 1.0);
		color = mix(vec3(1.0), color, len);

		gl_FragColor = vec4(color,  1.0);
	}
`,
});
const FxBasicFxMaterialImpl = createFxBasicFxMaterialImpl();

extend({ FxMaterialImpl, FxBasicFxMaterialImpl });

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

   // const blur = useBlur({
   //    size,
   //    dpr: 1,
   //    src: renderTarget.texture,
   // });

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const noise = useNoise({
      size,
      dpr: 0.3,
      fboAutoSetSize: true,
      scale: 0.4,
      noiseOctaves: 2,
      // mixSrc: fluid.texture,
      mixSrcColorFactor: 0.5,
      mixSrcUvFactor: 0.6,
   });

   noise.setValues({
      mixSrc: fluid.texture,
   });

   useFrame((state) => {
      updateRenderTarget({ gl: state.gl });
      noise.render(state);
      // blur.render(state);
      fluid.render(state);
   });

   const ref = useRef<any>();

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterialImpl
               key={FxMaterialImpl.key}
               ref={ref}
               src={noise.texture}
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

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterialImpl: FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
         fxBasicFxMaterialImpl: FxBasicFxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
