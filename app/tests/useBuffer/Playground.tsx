"use client";

import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useBuffer,
   useFluid,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl();
extend({ FxMaterialImpl });

export const Playground = () => {
   const { size } = useThree();

   const [mask] = useTexture(["/momo.jpg"]);

   const basic = useBuffer({
      size,
      dpr: 1,
      texture: {
         src: mask,
         fit: "contain",
      },
   });

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.01,
      timeStrength: 0.4,
   });

   const fluid = useFluid({
      size,
      dpr: 0.25,
   });

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      basic.setValues,
      {
         mixSrc: noise.texture,
         mixDst: noise.texture,
         mixMap: fluid.texture,
      }
   );

   useFrame((state) => {
      basic.render(state, {
         ...setBasicFxGUIValues(),
      });
      fluid.render(state);
      noise.render(state);
      updateBasicFxGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={basic.texture} />
      </mesh>
   );
};
