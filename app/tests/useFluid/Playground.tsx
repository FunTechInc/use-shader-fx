"use client";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useFluid, useNoise } from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";
import { TextureRenderer } from "../../_components/WebGL/TextureRenderer";

export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/mask.png"]);

   // const noise = useNoise({
   //    size,
   //    dpr: 1,
   //    scale: 0.01,
   //    timeStrength: 0.4,
   // });

   const fluid = useFluid({
      size,
      dpr: 0.25,
      contrast: {
         factor: new THREE.Vector4(5, 2, 1, 1),
      },
      colorBalance: {
         factor: new THREE.Vector3(0.2, 0.2, 0.2),
      },
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      fluid.setValues,
      {
         mixSrc: mask,
         mixDst: mask,
         mixMap: mask,
      }
   );

   useFrame((state) => {
      fluid.render(state, {
         ...setBasicFxGUIValues(),
      });
      updateBasicFxGUI();
   });

   return <TextureRenderer src={fluid.texture} />;
};
