"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useFluid, useRawBlank } from "@/packages/use-shader-fx/src";
import { TextureRenderer } from "../../_components/WebGL/TextureRenderer";

export const Playground = () => {
   const { size } = useThree();

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const rawShader = useRawBlank({
      size,
      dpr: 1,
      uniforms: {
         src: { value: fluid.velocity },
      },
      vertexShader: `
			void main() {
				gl_Position = vec4(position, 1.0);
			}
		`,
      fragmentShader: `
			uniform sampler2D src;
			void main() {
				vec2 uv = vUv;
				vec2 vel = texture2D(src, uv).rg;
				float len = length(vel);
				vel = vel * 0.5 + 0.5;
				
				vec3 color = vec3(vel.x, vel.y, 1.0);
				color = mix(vec3(1.0), color, len);

				gl_FragColor = vec4(color,  1.);
			}
		`,
   });

   useFrame((state) => {
      rawShader.render(state);
      fluid.render(state);
   });

   return <TextureRenderer src={rawShader.texture} />;
};
