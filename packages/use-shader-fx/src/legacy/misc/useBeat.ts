import * as THREE from "three";
import { Easing, EasingTypes } from "../libs/Easings";
import { useCallback } from "react";

/** Returns a unique hash specific to the beat */
function getHash(input: number) {
   let n = Math.sin(input * 12.9898) * 43758.5453;
   return n - Math.floor(n);
}

type BeatValues = {
   beat: number;
   floor: number;
   fract: number;
   /** unique hash specific to the beat */
   hash: number;
};

/**
 * @param ease easing functions are referenced from https://github.com/ai/easings.net , default : "easeOutQuart"
 */
export const useBeat = (bpm: number, ease: EasingTypes = "easeOutQuart") => {
   const rhythm = bpm / 60;
   const easing = Easing[ease];
   const updateBeat = useCallback(
      (clock: THREE.Clock) => {
         let beat = clock.getElapsedTime() * rhythm;
         const floor = Math.floor(beat);
         const fract = easing(beat - floor);
         beat = fract + floor;
         const hash = getHash(floor);
         return {
            beat,
            floor,
            fract,
            hash,
         } as BeatValues;
      },
      [rhythm, easing]
   );
   return updateBeat;
};
