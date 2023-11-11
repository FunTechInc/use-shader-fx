import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxTextureMaterial: any;
      }
   }
}

export type TFxTextureMaterial = {
   u_fx: THREE.Texture | null;
   u_postFx: THREE.Texture | null;
};

export const FxTextureMaterial = shaderMaterial(
   {
      u_fx: null,
      u_postFx: null,
   },
   `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`,
   `
		precision mediump float;
		varying vec2 vUv;
		uniform sampler2D u_fx;
		uniform sampler2D u_postFx;

		void main() {
			vec2 uv = vUv;

			vec2 fxmap = texture2D(u_fx, uv).rg;
			// fxmap=fxmap*2.0-1.0;
			uv += fxmap * 0.1;

			vec3 postFx = texture2D(u_postFx, uv).rgb;
			
			gl_FragColor = vec4(postFx,1.0);
			
		}
	`
);
