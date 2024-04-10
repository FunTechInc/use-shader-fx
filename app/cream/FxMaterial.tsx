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
			vec2 uv = vUv;
			vec4 color = texture2D(u_fx, uv);
			gl_FragColor = color;
			// gl_FragColor.rgb = color.rgb;
			// gl_FragColor.a = color.r + color.g + color.b;
		}
	`
);
