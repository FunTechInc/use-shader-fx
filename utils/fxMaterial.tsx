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
   u_fx: THREE.Texture | null;
   /** Set it to 0.0 if you want it to be transparent. */
   u_alpha: number | null;
};

export const FxMaterial = shaderMaterial(
   {
      u_fx: null,
      u_alpha: 1.0,
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
		uniform float u_alpha;

		void main() {
			vec2 uv = vUv;
			gl_FragColor = texture2D(u_fx, uv);
			if(u_alpha > 0.0){
				gl_FragColor.a = u_alpha;
			}
		}
	`
);
