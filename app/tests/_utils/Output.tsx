import * as THREE from "three";

export const Output = ({ src }: { src: THREE.Texture }) => {
   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <shaderMaterial
            uniforms={{
               src: { value: src },
            }}
            vertexShader={`
					varying vec2 vUv;
					void main() {
						vUv = uv;
						gl_Position = vec4(position, 1.0);
					}
				`}
            fragmentShader={`
						uniform sampler2D src;
						varying vec2 vUv;
						void main() {
							gl_FragColor = texture2D(src, vUv);
						}
					`}
         />
      </mesh>
   );
};
