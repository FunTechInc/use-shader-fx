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
			
			// vec4 color = texture2D(u_fx, uv);
			// gl_FragColor = vec4(color.rgb,1.);
			
			vec2 vel = texture2D(u_fx, uv).xy;
			float len = length(vel);
			vel = vel * 0.5 + 0.5;
			
			vec3 color = vec3(vel.x, vel.y, len);
			color = mix(vec3(0.), color, len);

			gl_FragColor = vec4(color,  1.0);
		}
	`
);
