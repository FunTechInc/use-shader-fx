"use client";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
   useFluid,
   useGrid,
   useNoise,
   useWindowPointer,
} from "@/packages/use-shader-fx/src";
import { TextureRenderer } from "../../_components/WebGL/TextureRenderer";

export const Playground = () => {
   const { size } = useThree();

   // console.log(size);

   const fluid = useFluid({
      size,
      dpr: 0.25,
      scale: new THREE.Vector2(40, 40),
      force: 10,
      contrast: {
         factor: new THREE.Vector4(5, 2, 1, 1),
      },
      colorBalance: {
         factor: new THREE.Vector3(0.2, 0.2, 0.2),
      },
   });

   const grid = useGrid({
      size,
      dpr: 1.5,
      count: new THREE.Vector2(40, 40),
      texture: {
         src: fluid.texture,
      },
   });

   const windowPointer = useWindowPointer(size);

   useFrame((state) => {
      grid.render(state);
      fluid.render({
         ...state,
         pointer: windowPointer,
      });
   });

   return <TextureRenderer src={grid.texture} />;
};
