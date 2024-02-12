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
   u_noise: THREE.Texture;
   u_noiseIntensity: number;
};

export const FxMaterial = shaderMaterial(
   {
      u_time: 0,
      u_resolution: new THREE.Vector2(0, 0),
      u_fx: new THREE.Texture(),
      u_noise: new THREE.Texture(),
      u_noiseIntensity: 0,
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
