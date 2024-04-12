"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
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

   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr: 0.01,
   });
   setCover({
      texture: funkun_mov,
   });

   const [updateMotionBlur, setMotionBlur, { output: motionblur }] =
      useMotionBlur({
         size,
         dpr: 0.1,
      });
   setMotionBlur({
      texture: cover,
      strength: 0.95,
   });

   const [updateBlur, setBlur, { output: blur }] = useSimpleBlur({
      size,
      dpr: 0.06,
   });
   setBlur({
      texture: motionblur,
      blurSize: 1,
      blurPower: 5,
   });

   const updatePointer = usePointer();
   useFrame((props) => {
      const pointer = updatePointer(props.pointer);
      updateCover(props);
      updateMotionBlur(props, {
         begin: pointer.prevPointer.divideScalar(3),
         end: pointer.currentPointer.divideScalar(3),
      });
      updateBlur(props);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={blur} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
//
