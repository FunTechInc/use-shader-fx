"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useBuffer, useFluid, useNoise } from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";
import { TextureRenderer } from "../../_components/WebGL/TextureRenderer";

export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/momo.jpg"]);
   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.01,
      timeStrength: 0.4,
   });

   const buffer = useBuffer({
      size,
      dpr: 1,
      texture: {
         src: mask,
         fit: 2,
      },
   });

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      buffer.setValues,
      {
         mixSrc: noise.texture,
         mixDst: noise.texture,
         mixMap: fluid.texture,
      }
   );

   useFrame((state) => {
      buffer.render(state, {
         ...setBasicFxGUIValues(),
      });
      fluid.render(state);
      noise.render(state);
      updateBasicFxGUI();
   });

   return <TextureRenderer src={buffer.texture} />;
};
