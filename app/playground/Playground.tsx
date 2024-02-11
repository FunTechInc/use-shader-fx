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
import {
   NoiseParams,
   NOISE_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useNoise";
import {
   ColorStrataParams,
   COLORSTRATA_PARAMS,
} from "@/packages/use-shader-fx/src/hooks/useColorStrata";
import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { useTexture, useVideoTexture } from "@react-three/drei";

extend({ FxMaterial });

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const video = useVideoTexture("/tv.mov");
   const sample = useTexture("/test.jpg");

   const { size, viewport } = useThree();

   const [updateChromakey, set, { output }] = useChromaKey({
      size,
      dpr: viewport.dpr,
   });

   set({
      texture: video,
      textureResolution: new THREE.Vector2(1920, 1080),
      keyColor: new THREE.Color(0x00ff00),
      similarity: 0.5,
      spill: 0.2,
      smoothness: 0.0,
      contrast: 1.8,
      gamma: 0.7,
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
