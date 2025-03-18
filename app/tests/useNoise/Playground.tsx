"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useFluid, useNoise } from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";
import { Output } from "../_utils/Output";

export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/mask.png"]);

   const noise = useNoise({
      size,
      dpr: 0.5,
      scale: 0.01,
      timeStrength: 0.4,
   });

   const fluid = useFluid({
      size,
      dpr: 0.24,
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      noise.setValues,
      {
         mixSrc: fluid.texture,
         mixDst: fluid.texture,
         mixMap: fluid.texture,
      }
   );

   useFrame((state) => {
      noise.render(state, {
         ...setBasicFxGUIValues(),
      });
      fluid.render(state);
      updateBasicFxGUI();
   });

   return <Output src={noise.texture} />;
};
