"use client";

import { useFrame, useThree, extend } from "@react-three/fiber";
import { createFxMaterialImpl, useBlank } from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl();
extend({ FxMaterialImpl });

/*===============================================
vibe coded by ShaderGPT
===============================================*/
export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/momo.jpg"]);

   const blank = useBlank({
      size,
      dpr: 1.5,
      pointerLerp: 0.2,
      uniforms: {
         src: { value: mask },
      },
      vertexShader: `
      	void main() {
      		gl_Position = vec4(position, 1.0);
      	}
      `,
      fragmentShader: `
      		precision mediump float;
				#define GLSLIFY 1

				vec2 rotate2D(vec2 p, float angle) {
					float s = sin(angle), c = cos(angle);
					return mat2(c, -s, s, c) * p;
				}

				float gridPattern(vec2 p) {
					vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
					return min(grid.x, grid.y);
				}

				float isoGrid(vec2 p) {
					p = rotate2D(p, 3.14159 / 4.0);
					vec2 grid1 = p;
					vec2 grid2 = rotate2D(p, 3.14159 / 3.0);
					return min(gridPattern(grid1 * 8.0), gridPattern(grid2 * 8.0));
				}

				void main() {
					vec2 uv = vUv;

					vec2 nPointer = pointer * .5 + .5;

					uv.x *= aspectRatio;
					nPointer.x *= aspectRatio;
					
					vec2 mouseInfluence = nPointer - uv;
					float mouseDist = length(mouseInfluence);
					float distortionAmount = smoothstep(0.3, 0.0, mouseDist) * 0.2;
					
					vec2 distortedUV = uv + normalize(mouseInfluence) * distortionAmount;
					
					float grid = isoGrid(distortedUV + time * 0.1);
					
					vec3 color1 = vec3(0.2, 0.4, 0.8);
					vec3 color2 = vec3(0.9, 0.3, 0.5);
					vec3 bgColor = vec3(0.1, 0.1, 0.2);
					
					float gridLines = smoothstep(0.8, 0.2, grid);
					vec3 finalColor = mix(bgColor, mix(color1, color2, sin(time) * 0.5 + 0.5), gridLines);
					
					gl_FragColor = vec4(finalColor, 1.0);
					
					#include <colorspace_fragment>
				}
      `,
   });

   useFrame((state) => {
      blank.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={blank.texture} />
      </mesh>
   );
};
