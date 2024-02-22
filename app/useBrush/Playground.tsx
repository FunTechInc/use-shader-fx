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
   Easing,
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
   const [updateBrush, setBrush, { output: brush }] = useBrush({
      size,
      dpr: viewport.dpr,
   });
   const [updateMarble, setMarble, { output: marble }] = useMarble({
      size,
      dpr: viewport.dpr,
   });

   const [updateAlphaBlending, setAlphaBlending, { output: alphaBlending }] =
      useAlphaBlending({ size, dpr: viewport.dpr });

   const [updateCS, setCS, { output: cs }] = useColorStrata({
      size,
      dpr: viewport.dpr,
   });

   setCS({
      laminateLayer: 20,
      scale: 0.48,
      laminateDetail: new THREE.Vector2(5.1, 5),
      distortion: new THREE.Vector2(2.87, 2.75),
      timeStrength: new THREE.Vector2(5.1, 2.1),
   });

   setMarble({
      scale: 0.002,
      timeStrength: 0.1,
   });

   setBrush({
      map: cs,
      texture: cs,
      mapIntensity: 0.2,
      radius: 0.05,
      smudge: 4,
      // motionBlur: 5,
      dissipation: 0.8,
      isCursor: false,
   });

   setAlphaBlending({
      texture: marble,
      map: brush,
   });

   const updatePointer = usePointer();
   const updateBeat = useBeat(157);

   useFrame((props) => {
      // ref.current!.u_tex = updateAlphaBlending(props, {
      //    texture: marble,
      //    map: updateBrush(props, {
      //       texture: updateMarble(props),
      //    }),
      // });
      const pointerValues = updatePointer(props.pointer);
      updateBrush(props, {
         // pressure: Easing.easeOutCirc(pointerValues.velocity.length() * 10) * 2,
         pointerValues: pointerValues,
      });
      // updateMarble(props);
      // updateAlphaBlending(props);
      const { beat, fract, floor, hash } = updateBeat(props.clock);
      updateCS(props, {
         beat: beat,
      });
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_tex={cs} ref={ref} />
      </mesh>
   );
};
