"use client";

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useFluid } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";

extend({ FxMaterial });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [updateFluid, , { output }] = useFluid({ size, dpr: viewport.dpr });

   useFrame((props) => {
      updateFluid(props);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial u_fx={output} key={FxMaterial.key} />
      </mesh>
   );
};
