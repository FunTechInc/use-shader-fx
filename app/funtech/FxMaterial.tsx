import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import frag from "./main.frag";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type FxMaterialProps = {
   u_fx: THREE.Texture;
   u_time: number;
   u_floor: number;
   u_contrast: number;
   u_brightness: number;
   u_saturation: number;
   u_noiseStrength: number;
   u_floorStrength: THREE.Vector2;
};

export const FxMaterial = shaderMaterial(
   {
      u_fx: new THREE.Texture(),
      u_time: 0,
      u_floor: 8,
      u_contrast: 1,
      u_brightness: 1,
      u_saturation: 1,
      u_noiseStrength: 0.3,
      u_floorStrength: new THREE.Vector2(0.2, 0.8),
   },

   `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`,
   frag
);
