"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useFluid } from "@/packages/use-shader-fx/src/legacy";
import { FxMaterial } from "./FxMaterial";

extend({ FxMaterial });

export const Playground = () => {
   const { size } = useThree();
   const [updateFluid, setFluid, { output: fluid, velocity }] = useFluid({
      size,
      dpr: 0.2,
   });

   setFluid({
      densityDissipation: 0.97,
      velocityDissipation: 0.99,
      velocityAcceleration: 0.01,
      splatRadius: 20,
      pressureIterations: 2,
      pressureDissipation: 0.9,
      curlStrength: 0,
      // fluidColor: new THREE.Color(0x0000ff),
   });

   useFrame((state) => {
      updateFluid(state);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={velocity} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
