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

			vec3 vel = texture2D(u_fx, uv).rgb;

			vec2 color = vel.xy;

			float len = length(color);

			color = color *.5+.5;

			vec3 outColor = vec3(color.x, color.y, 1.0);

			outColor = mix(vec3(1.),outColor, len);

			gl_FragColor = vec4(outColor, 1.0);
			// gl_FragColor.rgb = color.rgb;
			// gl_FragColor.a = color.r + color.g + color.b;
		}
	`
);
