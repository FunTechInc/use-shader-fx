"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useFluid, useBuffer, useBlank } from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";
import { Output } from "../_utils/Output";

export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/momo.jpg"]);

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const blank = useBlank({
      size,
      dpr: 1.5,
      pointerLerp: 0.1,
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
					vec3 bgColor = vec3(0., 0., 0.);
					
					float gridLines = smoothstep(0.8, 0.2, grid);
					vec3 finalColor = mix(bgColor, mix(color1, color2, sin(time) * 0.5 + 0.5), gridLines);
					float alpha = mix(0., 1., gridLines);
					gl_FragColor = vec4(finalColor, alpha);
					
					#include <colorspace_fragment>
				}
      `,
   });

   const basic = useBuffer({
      size,
      dpr: 1.5,
      texture: {
         src: mask,
         fit: 1,
      },
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      basic.setValues,
      {
         mixSrc: blank.texture,
         mixDst: fluid.texture,
         mixMap: fluid.texture,
      }
   );

   useFrame((state) => {
      basic.render(state, {
         ...setBasicFxGUIValues(),
      });
      blank.render(state);
      fluid.render(state);
      updateBasicFxGUI();
   });

   return <Output src={basic.texture} />;
};
