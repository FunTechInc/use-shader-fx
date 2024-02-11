import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import fragment from "./main.frag";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type FxMaterialProps = {
   u_time: number;
   u_resolution: THREE.Vector2;
   u_fx: THREE.Texture;
};

export const FxMaterial = shaderMaterial(
   {
      u_time: 0,
      u_resolution: new THREE.Vector2(0, 0),
      u_fx: new THREE.Texture(),
   },

   `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`,
   fragment
);
