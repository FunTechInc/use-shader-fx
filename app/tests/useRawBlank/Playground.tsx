"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useBuffer,
   useFluid,
   useNoise,
   useRawBlank,
} from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl();
extend({ FxMaterialImpl });

export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/momo.jpg"]);

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const rawShader = useRawBlank({
      size,
      dpr: 1,
      uniforms: {
         src: { value: new THREE.Texture() },
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
				gl_FragColor = texture2D(src, uv);
			}
		`,
   });
   rawShader.setValues({ src: fluid.texture });

   useFrame((state) => {
      rawShader.render(state);
      fluid.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={rawShader.texture} />
      </mesh>
   );
};
