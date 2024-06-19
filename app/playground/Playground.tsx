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
import { useRawBlank } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { OrbitControls, useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [funkun] = useLoader(THREE.TextureLoader, ["/funkun.jpg"]);

   const [update, set, { output }] = useRawBlank({
      size,
      dpr: 2,
      onBeforeInit: (param) => {
         Object.assign(param.uniforms, {
            uTexture: { value: funkun },
            uTime: { value: 0 },
         });
         param.fragmentShader = param.fragmentShader.replace(
            "#usf <uniforms>",
            `
					uniform sampler2D uTexture;
					uniform float uTime;
				`
         );
         param.fragmentShader = param.fragmentShader.replace(
            "#usf <main>",
            `
					vec2 uv = vUv;
					vec2 perDivSize = vec2(20.) / uResolution;
					vec4 outColor = vec4(
						texture2D(uTexture, uv + perDivSize * vec2(-1.0, -1.0)) +
						texture2D(uTexture, uv + perDivSize * vec2(0.0, -1.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(1.0, -1.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(-1.0, 0.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(0.0,  0.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(1.0,  0.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(-1.0, 1.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(0.0,  1.0)) + 
						texture2D(uTexture, uv + perDivSize * vec2(1.0,  1.0))
						) / 9.0;
					usf_FragColor = outColor;
					usf_FragColor.r += sin(uTime);
				`
         );
      },
   });

   useFrame((state) => {
      update(
         state,
         { hofsehfgose: 2 },
         {
            uTime: state.clock.getElapsedTime(),
         }
      );
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={output} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
//
