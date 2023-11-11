import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type TFxMaterial = {
   u_fx: THREE.Texture | null;
};

export const FxMaterial = shaderMaterial(
   {
      u_fx: null,
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

		void main() {
			vec2 uv = vUv;
			gl_FragColor = texture2D(u_fx, uv);
		}
	`
);
