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
} from "@/packages/use-shader-fx/src";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useTexture, useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const video = useVideoTexture("/gorilla.mov");

   const { size, viewport } = useThree();

   const [updateChromakey, set, { output }] = useChromaKey({
      size,
      dpr: viewport.dpr,
   });

   set({
      texture: video,
      textureResolution: new THREE.Vector2(1920, 1080),
      keyColor: new THREE.Color(0x71f998),
      similarity: 0.2,
      spill: 0.2,
      smoothness: 0.1,
      contrast: 1,
      gamma: 1,
      brightness: 0.0,
   });

   useFrame((props) => {
      updateChromakey(props);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_fx={output} ref={ref} />
      </mesh>
   );
};
