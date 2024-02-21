"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   useNoise,
   useFluid,
   useFxBlending,
   useColorStrata,
   useBrightnessPicker,
   useChromaKey,
   useBeat,
   useRipple,
   useMarble,
   useFxTexture,
   useBrush,
   useFPSLimiter,
   EASING,
   usePointer,
   useAlphaBlending,
} from "@/packages/use-shader-fx/src";

import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useTexture, useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const { size, viewport } = useThree();
   const bbbb = useVideoTexture("/bbbb.mov");
   const glitch = useVideoTexture("/glitch.mov");
   const [updateBrush, setBrush, { output: brush }] = useBrush({
      size,
      dpr: viewport.dpr,
   });
   const [updateMarble, setMarble, { output: marble }] = useMarble({
      size,
      dpr: viewport.dpr,
   });

   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: viewport.dpr,
   });

   const [updateAlphaBlending, setAlphaBlending, { output: alphaBlending }] =
      useAlphaBlending({ size, dpr: viewport.dpr });

   setMarble({
      scale: 0.01,
   });

   setAlphaBlending({
      texture: bbbb,
      map: brush,
   });

   const colorVec = useRef(new THREE.Vector3());
   setBrush({
      texture: marble,
      // map: marble,
      // mapIntensity: 0.15,
      radius: 0.1,
      // smudge: 4,
      motionBlur: 0,
      dissipation: 0.9,
   });

   setFluid({
      fluid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.0, Math.abs(velocity.x) * 200);
         const gCol = Math.max(0.0, Math.abs(velocity.y) * 200);
         const bCol = Math.max(0.0, (rCol + gCol) / 2);
         return colorVec.current.set(rCol, gCol, bCol);
      },
   });

   // const updateBeat = useBeat(157);

   const limiter = useFPSLimiter();
   const updatePointer = usePointer();

   useFrame((props) => {
      // const pointerValues = updatePointer(props.pointer);
      updateBrush(props, {
         // pointerValues,
         // pressure: EASING.easeOutCirc(pointerValues.velocity.length()) * 10,
      });
      updateMarble(props);
      updateAlphaBlending(props);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_fx={alphaBlending} ref={ref} />
      </mesh>
   );
};
