"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import {
   useFrame,
   useThree,
   extend,
   useLoader,
   RootState,
} from "@react-three/fiber";
import { useFluid, useBloom } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";

extend({ FxMaterial });

export const Playground = () => {
   const { size } = useThree();

   const [updateBloom, setBloom, { output: bloom }] = useBloom({
      size,
      dpr: 2,
   });
   useFrame((state) => {
      updateBloom(state);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={bloom} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
