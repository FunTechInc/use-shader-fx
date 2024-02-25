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
   useCoverTexture,
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

   const [updateFluid, setFluid, { output: fluid }] = useFluid({
      size,
      dpr: viewport.dpr,
   });

   const [updateCS, setCS, { output: cs }] = useColorStrata({
      size,
      dpr: viewport.dpr,
   });

   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr: viewport.dpr,
   });

   setCover({
      texture: bbbb,
      textureResolution: new THREE.Vector2(2952, 1510),
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
      // map: cs,
      // texture: cs,
      // mapIntensity: 0.2,
      radius: 0.2,
      // smudge: 4,
      // motionBlur: 5,
      dissipation: 0.9,
      isCursor: false,
   });

   setAlphaBlending({
      texture: marble,
      map: brush,
   });

   const updatePointer = usePointer(0);
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
         pointerValues: pointerValues,
      });
      // updateCover(props);
      // updateMarble(props);
      // updateAlphaBlending(props);
      // const { beat, fract, floor, hash } = updateBeat(props.clock);
      // updateCS(props, {
      //    beat: beat,
      // });
      // updateFluid(props, {
      //    pointerValues: pointerValues,
      // });
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} u_tex={brush} ref={ref} />
      </mesh>
   );
};
