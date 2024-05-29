import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { ShaderChunk } from "@/packages/use-shader-fx/src";
import { RomanticismConfig } from "./useRomanticism";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type FxMaterialProps = {
   u_romance: THREE.Texture;
   u_original: THREE.Texture;
   u_time: number;
   u_floor: number;
   u_contrast: number;
   u_gamma: number;
   u_noiseStrength: number;
   u_floorStrength: THREE.Vector2;
};

export const FxMaterial = shaderMaterial(
   {
      u_romance: new THREE.Texture(),
      u_original: new THREE.Texture(),
      u_time: 0,
      u_floor: RomanticismConfig.floor,
      u_contrast: RomanticismConfig.contrast,
      u_gamma: RomanticismConfig.gamma,
      u_noiseStrength: RomanticismConfig.noisestrength,
      u_floorStrength: RomanticismConfig.floorStrength,
   },
   ShaderChunk.planeVertex,
   `
		precision highp float;
		varying vec2 vUv;
		uniform sampler2D u_romance;
		uniform sampler2D u_original;

		uniform float u_time;
		uniform float u_floor;
		uniform float u_contrast;
		uniform float u_gamma;

		uniform float u_noiseStrength;
		uniform vec2 u_floorStrength;

		float rand(vec2 n) { 
			return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
		}

		void main() {
			vec2 uv = vUv;

			// original color
			vec4 originalColor = texture2D(u_original, uv);

			// romantic color
			float noise = rand(vUv + sin(u_time)) * u_noiseStrength;
			noise=noise*.5+.5; // .5 ~ 1.

			float posY = floor(uv.y * u_floor);
			float posMap = mod(posY, 2.) == 0. ? 1. : -1.;
			uv.x += posMap * u_floorStrength.x * .01;
			uv.y += posMap * u_floorStrength.y * .01;
			
			vec4 romance = texture2D(u_romance, uv);
			vec3 gamma = pow(romance.rgb, vec3(1./u_gamma));
			gamma.rgb = ((gamma.rgb-.5)*u_contrast)+.5;

			vec4 romanticColor = vec4(vec3(clamp(gamma * noise,0.,1.)),romance.a);

			// mix
			gl_FragColor = mix(originalColor, romanticColor, sin(u_time)*0.5+0.5);
			// gl_FragColor = mix(originalColor, romanticColor, 0.);
		}
	`
);
