"use client";

import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useFluid,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";

const FxMaterialImpl = createFxMaterialImpl();
extend({ FxMaterialImpl });

export const Playground = () => {
   const { size } = useThree();

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

   // noise.setValues();

   const { updateBasicFxGUI, setBasicFxGUIValues } = useBasicFxGUI(
      noise.setValues,
      fluid.texture
   );

   useFrame((state) => {
      noise.render(state, {
         ...setBasicFxGUIValues(),
      });
      fluid.render(state);
      updateBasicFxGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={noise.texture} />
      </mesh>
   );
};
