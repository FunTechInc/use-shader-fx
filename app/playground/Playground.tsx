"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import {
   useCoverTexture,
   useFluid,
   useSingleFBO,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";

extend({ FxMaterial });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [funkun] = useLoader(THREE.TextureLoader, ["/funkun.jpg"]);

   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr: 0.01,
   });
   setCover({
      texture: funkun,
   });

   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: {
         dpr: 0.08,
         effect: {
            fbo: false,
         },
      },
   });

   setFluid({
      density_dissipation: 0.99,
      velocity_dissipation: 0.99,
      splat_radius: 0.001,
   });

   useFrame((props) => {
      updateCover(props);
      // updateFluid(props);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={cover} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
