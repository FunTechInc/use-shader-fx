"use client";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
   useBuffer,
   useFluid,
   useGrid,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";
import { TextureRenderer } from "../../_components/WebGL/TextureRenderer";

export const Playground = () => {
   const { size } = useThree();

   const [momo] = useTexture(["/momo.jpg"]);
   const [sprite] = useTexture(["/sprite.png"]);

   const buffer = useBuffer({
      size,
      dpr: 1.5,
      texture: {
         src: momo,
         fit: 1,
      },
   });

   const fluid = useFluid({
      size,
      dpr: 0.3,
      scale: new THREE.Vector2(70, 70),
      colorBalance: {
         factor: new THREE.Vector3(0, 10, 0),
      },
      contrast: {
         factor: new THREE.Vector4(1, 3, 1, 1),
      },
      bounce: false,
   });

   const grid = useGrid({
      size,
      dpr: 1.5,
      texture: {
         src: momo,
         // src: fluid.texture,
         fit: 0,
      },
   });

   grid.setValues({
      count: new THREE.Vector2(100, 100),
      shuffle: {
         frequency: 10,
      },
      sprite: {
         src: sprite,
         shuffleSpeed: 0.4,
      },
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      grid.setValues,
      {
         mixSrc: momo,
         mixDst: momo,
         mixMap: fluid.texture,
      }
   );

   useFrame((state) => {
      grid.render(state, {
         ...setBasicFxGUIValues(),
      });
      const nTime = Math.sin(state.clock.getElapsedTime()) * 0.5 + 0.5;
      grid.setValues({
         shuffle: {
            range: nTime * 100,
         },
      });
      fluid.render(state);
      updateBasicFxGUI();
   });

   return <TextureRenderer src={grid.texture} />;
};
