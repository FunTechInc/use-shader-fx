"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useFluid } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";

extend({ FxMaterial });

export const Playground = () => {
   const { size } = useThree();
   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: {
         shader: 0.2,
         fbo: 0.8,
      },
   });

   setFluid({
      densityDissipation: 0.99,
      velocityDissipation: 0.99,
      splatRadius: 0.001,
      pressureIterations: 1,
   });

   useFrame((state) => {
      updateFluid(state);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={fluid} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
