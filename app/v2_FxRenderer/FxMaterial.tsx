import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type FxMaterialProps = {
   u_fx: THREE.Texture;
   u_noise?: THREE.Texture;
   u_color0?: THREE.Color;
   u_color1?: THREE.Color;
};

export const FxMaterial = shaderMaterial(
   {
      u_fx: new THREE.Texture(),
      u_noise: new THREE.Texture(),
      u_color0: new THREE.Color(0x1974d2),
      u_color1: new THREE.Color(0xff1e90),
   },

   `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`,
   `
		precision highp float;
		varying vec2 vUv;
		uniform sampler2D u_fx;
		uniform sampler2D u_noise;
		uniform vec3 u_color0;
		uniform vec3 u_color1;

		float vignetteStrength = 0.88; // 強度（0.0〜1.0）
		float vignetteRadius = 0.8;  // 効果が始まる半径（0.0〜1.0）

		float rand(vec2 n) { 
			return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
		}

		void main() {
			vec2 uv = vUv;

			float grain = rand(uv); // -1.0〜1.0

			// ビネット
			vec2 position = uv - 0.5;
			float distance = length(position);
			float vignette = smoothstep(vignetteRadius, vignetteRadius - 0.5, distance);
			vignette = mix(1.0, vignette, vignetteStrength);
			
			// ノイズ
			vec4 noise = texture2D(u_noise, uv);
			vec3 noisedColor = mix(u_color0, u_color1, length(noise.rg * uv) + .1);
			noisedColor += grain * .1;

			// モデル
			vec4 modelColor = texture2D(u_fx,uv);
			modelColor.rgb+=grain * .3;
			
			modelColor.rgb+=noisedColor;

			// モデルとノイズを混ぜる		
			vec3 mixedModelColor = mix(noisedColor, modelColor.rgb, modelColor.a);

			vec3 finalColor = mixedModelColor * vignette;

			gl_FragColor = vec4(finalColor, 1.0);
			
		}
	`
);
