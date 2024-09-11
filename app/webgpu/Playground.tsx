"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import * as WebGPU from "three/webgpu";
import * as TSL from "three/tsl";

import { useNoise, useFluid } from "@/packages/use-shader-fx/src/webgpu";
import { useFrame, useThree } from "@react-three/fiber";

export const Playground = () => {
   const three = useThree();
   const fluid = useFluid({
      size: three.size,
      dpr: 0.2,
   });
   const material = useMemo(() => {
      const _mat = new WebGPU.NodeMaterial();
      _mat.vertexNode = TSL.vec4(TSL.positionGeometry, 1);
      _mat.fragmentNode = TSL.texture(fluid.texture);
      return _mat;
   }, [fluid.texture]);

   useFrame((state) => {
      fluid.render(state as any);
   });

   return (
      <>
         <mesh material={material}>
            <planeGeometry args={[2, 2]} />
         </mesh>
      </>
   );
};
