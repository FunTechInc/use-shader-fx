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
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useFluid,
   useCoverTexture,
} from "@/packages/use-shader-fx/src";
import { Float, OrbitControls } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;

	vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

	void main() {
	
		vec4 fluid = texture2D(src, vUv);
		vec2 vel = fluid.rg;

		// THINK つまりfluidのcolorMapは最後lenを返せばいいのか？ それをを色調補正すれば以下ができるじゃない
		float len = length(vel); // 0~1
		
		vec3 fluidColor = vec3(len);
		fluidColor.r = clamp(fluidColor.r + .2, 0., 1.);
		fluidColor.b = clamp(fluidColor.b + .1, 0., 1.);

		// THINK ここまでがデフォルトのfluidのcolor

		// THINK ここからがbasicFxの色調補正

		vec3 hsv = rgb2hsv(fluidColor);

		hsv.y *= 100.; // 彩度
		hsv.z *= 2.; // 明度

		vec3 final = hsv2rgb(hsv);
		
		vec3 gamma = pow(final, vec3(1./.01));
		gamma = ((gamma-.5)*10.)+.5;
		
		gl_FragColor = vec4(vec3(gamma),  len);
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const fluid = useFluid({
      size,
      dpr: 0.8,
   });

   useFrame((state) => {
      fluid.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={fluid.texture} />
      </mesh>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterialImpl: FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
         BasicFxMaterialImpl: BasicFxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
