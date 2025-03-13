"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useFluid,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useBasicFxGUI } from "../_utils/useBasicFxGUI";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl();
extend({ FxMaterialImpl });

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
      // dissipation: 0.8,
      // pressureIterations: 1,
      // scale: new THREE.Vector2(10, 10),
      // force: 1,
   });
   fluid.setValues({
      // scale: new THREE.Vector2(100, 200),
      dissipation: 0.8,
      force: 20,
      bounce: true,
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
      // fluid.render(state);
      updateBasicFxGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={fluid.texture} />
      </mesh>
   );
};
