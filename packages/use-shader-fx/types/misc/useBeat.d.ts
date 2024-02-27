import * as THREE from "three";
import { EasingTypes } from "../libs/easing";
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
export declare const useBeat: (bpm: number, ease?: EasingTypes) => (clock: THREE.Clock) => BeatValues;
export {};
