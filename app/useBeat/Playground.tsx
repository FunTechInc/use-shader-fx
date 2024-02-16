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
   const bbbb = useVideoTexture("/bbbb.mov");
   // const glitch = useVideoTexture("/glitch.mov");

   const [updateNoise, set, { output: noise }] = useNoise({
      size,
      dpr: viewport.dpr,
   });

   const [updateChromaKey, setChromaKey, { output: chromaKey }] = useChromaKey({
      size,
      dpr: viewport.dpr,
   });

   setChromaKey({
      texture: bbbb,
      textureResolution: new THREE.Vector2(2952, 1510),
      keyColor: new THREE.Color(1.0, 1.0, 0.0),
      similarity: 0.2,
      contrast: 5,
      spill: 0.5,
   });

   const [updateRipple, setRipple, { output: ripple }] = useRipple({
      texture: noise,
      size,
      dpr: viewport.dpr,
   });

   const [updateMarble, setMarble, { output: marble }] = useMarble({
      size,
      dpr: viewport.dpr,
   });

   const updateBeat = useBeat(157);

   useFrame((props) => {
      // updateRipple(props);
      // updateNoise(props);
      const { beat, fract, floor, hash } = updateBeat(props.clock);
      updateChromaKey(props);
      updateMarble(props, {
         beat: beat,
         timeStrength: fract * 0.05,
         scale: Math.max(hash * 0.01, 0.002),
         complexity: Math.max(hash * 2, 1),
         complexityAttenuation: hash,
         pattern: hash * 10,
      });
      ref.current!.u_hash = hash;
      ref.current!.u_fract = fract;
      // updateNoise(props, {
      //    beat: beat,
      // });
      // ref.current!.u_noiseIntensity =
      //    hash > 0.5 ? hash * fract : hash * fract * -1;
      // ref.current!.u_fx = hash > 0.5 ? glitch : noise;
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial
            key={FxMaterial.key}
            u_fx={marble}
            u_noise={noise}
            u_bbbb={chromaKey}
            ref={ref}
         />
      </mesh>
   );
};
