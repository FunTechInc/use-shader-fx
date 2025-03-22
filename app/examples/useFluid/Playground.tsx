"use client";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
   useBuffer,
   useFluid,
   useGrid,
   useWindowPointer,
} from "@/packages/use-shader-fx/src";
import { TextureRenderer } from "../../_components/WebGL/TextureRenderer";
import { useTexture } from "@react-three/drei";

export const Playground = () => {
   const { size } = useThree();

   const [sprite] = useTexture(["/sprite.png"]);

   const fluid = useFluid({
      size,
      dpr: 0.2,
      radius: new THREE.Vector2(50, 50),
   });

   const grid = useGrid({
      size,
      dpr: 1.5,
      count: new THREE.Vector2(70, 70),
      texture: {
         src: fluid.texture,
      },
      sprite: {
         src: sprite,
         length: 10,
         shuffleSpeed: 0.2,
      },
   });

   const buffer = useBuffer({
      size,
      dpr: 1.5,
      texture: {
         src: grid.texture,
      },
      mixSrc: {
         src: fluid.texture,
         uv: {
            factor: 0.01,
            mixMap: {
               src: fluid.texture,
            },
         },
      },
      colorBalance: true,
      hsv: true,
      posterize: false,
   });

   const windowPointer = useWindowPointer(size);

   useFrame((state) => {
      const loop = Math.sin(state.clock.getElapsedTime()) * 0.5 + 0.5;
      grid.render(state);
      fluid.render({
         ...state,
         pointer: windowPointer,
      });
      buffer.render(state, {
         hsv: {
            hueShift: loop,
            saturation: 1 + loop * 4,
            brightness: 1 + loop,
         },
         colorBalance: {
            factor: (val) => val.set(1 + loop, loop, 1 - loop),
         },
         posterize: {
            levels: (val) => val.set(3 + loop, 2 + loop, 1 + loop, 10 * loop),
         },
      });
   });

   return <TextureRenderer src={buffer.texture} />;
};
