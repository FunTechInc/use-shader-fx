"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
   useFrame,
   useThree,
   extend,
   useLoader,
   createPortal,
} from "@react-three/fiber";
import {
   useDoubleFBO,
   useSingleFBO,
   useFluid,
   useCoverTexture,
   useMotionBlur,
   useSimpleBlur,
   usePointer,
   useNoise,
   useCreateWobble3D,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { OrbitControls, useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   // /FT_Ch02-comp.mp4
   // http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   const funkun_mov = useVideoTexture("/FT_Ch02-comp.mp4", {
      width: 1280,
      height: 720,
   });
   const [funkun] = useLoader(THREE.TextureLoader, ["/funkun.jpg"]);

   const [updateNoise, setNoise, { output: noise }] = useNoise({
      size,
      dpr: 0.2,
   });
   setNoise({
      noiseOctaves: 1,
      fbmOctaves: 1,
      warpOctaves: 1,
      timeStrength: 1,
      scale: 2000,
   });

   const [updateWobble, wobble] = useCreateWobble3D({
      materialParameters: {
         color: "hotpink",
         // displacementMap: noise,
         // displacementScale: 2,
      },
   });

   updateWobble(null, {
      // wobbleStrength: 0.0,
      // colorMix: 0,
   });

   useFrame((state) => {
      updateWobble(state);
      // updateNoise(state);
   });

   return (
      <>
         <mesh>
            <directionalLight
               color={"white"}
               position={[0.25, 2, 3]}
               intensity={2}
            />
            <ambientLight intensity={1} />
            <primitive object={wobble.mesh} />
            {/* <icosahedronGeometry args={[2, 20]} />
            <meshPhysicalMaterial color={"hotpink"} displacementMap={noise} /> */}
            <OrbitControls />
         </mesh>
      </>
   );
};
//
