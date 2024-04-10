"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, extend, useLoader } from "@react-three/fiber";
import { useFluid, useCoverTexture } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const { size } = useThree();

   const funkun = useVideoTexture("/FT_Ch02-comp.mp4", { width: 920 });
   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr: 0.1,
   });

   setCover({
      texture: funkun,
   });

   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: {
         dpr: 0.08,
         effect: {
            shader: true,
            fbo: true,
         },
      },
   });

   setFluid({
      density_dissipation: 0.99,
      velocity_dissipation: 0.99,
      splat_radius: 0.001,
   });

   useFrame((props) => {
      // updateFluid(props);
      updateCover(props);
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
