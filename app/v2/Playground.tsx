"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useNoise, useFluid } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";

extend({ FxMaterial });

export const Playground = () => {
   const { size, gl } = useThree();

   const fluid = useFluid({
      size,
      dpr: 0.5,
   });

   useFrame((state) => {
      fluid.render(state);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={fluid.texture} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
