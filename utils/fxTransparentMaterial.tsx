import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxTransparentMaterial: any;
      }
   }
}

export type FxTransparentMaterialProps = {
   u_fx: THREE.Texture | null;
};

export const FxTransparentMaterial = shaderMaterial(
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
		precision highp float;
		varying vec2 vUv;
		uniform sampler2D u_fx;

		void main() {
			vec2 uv = vUv;
			vec3 color = texture2D(u_fx, uv).rgb;
			float brightness = dot(color, vec3(.2, .2, .2));
			float minVal = 0.0;
			float maxVal = 1.0;
			float alpha = smoothstep(minVal, maxVal, brightness);
			gl_FragColor = vec4(color, alpha);
		}
	`
);
