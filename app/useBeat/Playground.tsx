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
   useFxTexture,
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
import { Console } from "console";

extend({ FxMaterial });

export const Playground = () => {
   const ref = useRef<FxMaterialProps>();

   const { size, viewport } = useThree();
   const video = useVideoTexture("/gorilla.mov");
   const glitch = useVideoTexture("/glitch.mov");

   const [updateNoise, set, { output: noise }] = useNoise({
      size,
      dpr: viewport.dpr,
   });

   const updateBeat = useBeat(157);

   useFrame((props) => {
      const { beat, fract, hash } = updateBeat(props.clock);
      updateNoise(props, {
         beat: beat,
      });
      ref.current!.u_noiseIntensity =
         hash > 0.5 ? hash * fract : hash * fract * -1;
      ref.current!.u_fx = hash > 0.5 ? glitch : video;
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_noise={noise} ref={ref} />
      </mesh>
   );
};
