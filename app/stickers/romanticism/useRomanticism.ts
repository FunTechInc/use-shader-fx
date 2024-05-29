import * as THREE from "three";

import { useRef } from "react";
import {
   useMotionBlur,
   useSimpleBlur,
   useHSV,
} from "@/packages/use-shader-fx/src";
import { useFrame, useThree } from "@react-three/fiber";

export const RomanticismConfig = {
   dpr: 0.1,
   // blur
   motionBlurStrength: 0.94,
   blurSize: 1.6,
   // color
   saturation: 0.1,
   brightness: 1.4,
   contrast: 1,
   gamma: 2,
   //grain noise
   noisestrength: 0.24,
   // floor
   floor: 12,
   floorStrength: new THREE.Vector2(0.24, 0.24),
};

export const useRomanticism = (texture: THREE.Texture) => {
   const { size } = useThree();
   const dpr = RomanticismConfig.dpr;

   // motion blur
   const [updateMotionBlur, setMotionBlur, { output: motionblur }] =
      useMotionBlur({
         size,
         dpr,
      });
   setMotionBlur({
      texture: texture,
      strength: RomanticismConfig.motionBlurStrength,
   });

   // simple blur
   const [updateBlur, setBlur, { output: blur }] = useSimpleBlur({
      size,
      dpr,
   });
   setBlur({
      texture: motionblur,
      blurPower: 1, //constant
      blurSize: RomanticismConfig.blurSize,
   });

   // hsv
   const [updateHSV, setHSV, { output: hsv }] = useHSV({
      size,
      dpr,
   });

   setHSV({
      texture: blur,
      saturation: RomanticismConfig.saturation,
      brightness: RomanticismConfig.brightness,
   });

   // frame
   const motionBlurBegin = useRef(new THREE.Vector2(0, 0));
   const motionBlurEnd = useRef(new THREE.Vector2(0, 0));
   const pointerVec = useRef(new THREE.Vector2(0, 0));

   useFrame((state) => {
      const currentPointer = pointerVec.current.lerp(state.pointer, 0.04);
      updateMotionBlur(state, {
         begin: motionBlurBegin.current
            .add(currentPointer)
            .multiplyScalar(0.16),
         end: motionBlurEnd.current.add(currentPointer).multiplyScalar(0.16),
      });
      updateBlur(state);
      updateHSV(state);
   });

   return hsv;
};
