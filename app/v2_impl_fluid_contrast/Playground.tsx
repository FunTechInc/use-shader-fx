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

		float len = length(vel); // 0~1
		
		vec4 fluidColor = vec4(len);
		
		// color overlay
		fluidColor.r *= clamp(fluidColor.r * .2, 0., 1.);
		fluidColor.g *= clamp(fluidColor.g * .1, 0., 1.);
		fluidColor.b *= clamp(fluidColor.b * .8, 0., 1.);
		// THINK ここまでがデフォルトのfluidのcolor
		
		// THINK ここからがbasicFxの色調補正
		// THINK ガンマ補正とコントラストはvec4でやればいいのかも
		
		// ガンマ補正
		float gammaFactor = .4;
		vec4 gamma = pow(fluidColor, vec4(1./gammaFactor));
		// コントラスト
		float contrastFactor = 1.;
		vec4 contrast = clamp(((gamma-.5)*contrastFactor)+.5, 0., 1.);
		
		vec4 outputColor = contrast;

		// color overlay
		outputColor.r *= clamp(outputColor.r * 1.2, 0., 1.);
		outputColor.g *= clamp(outputColor.g * .4, 0., 1.);
		outputColor.b *= clamp(outputColor.b * .9, 0., 1.);

		// 彩度と明度
		vec3 hsv = rgb2hsv(outputColor.rgb);
		hsv.y *= 2.4; // 彩度
		hsv.z *= 2.; // 明度
		outputColor.rgb = hsv2rgb(hsv);

		// alpha TODO * transparentを選択できるようにする？
		float alpha = outputColor.a;
		// float alpha = 1.;
		gl_FragColor = vec4(outputColor.rgb, alpha);
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const fluid = useFluid({
      size,
      dpr: 0.6,
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
