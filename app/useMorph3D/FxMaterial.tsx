import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
// import fragment from "./main.frag";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type FxMaterialProps = {
   u_fx: THREE.Texture;
};

export const FxMaterial = shaderMaterial(
   {
      u_fx: new THREE.Texture(),
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

		void main() {
			gl_FragColor = texture2D(u_fx,vUv);
		}
	`
);
