import * as THREE from "three";
import { RootState, Size } from "@react-three/fiber";

export type HooksProps = {
   size: Size;
   dpr: number;
   /** Defines the count of MSAA samples. Can only be used with WebGL 2. Default is 0. */
   samples?: number;
};

/**
 * @returns {HooksReturn<T, O>}
 *  updateFx - A function to be called inside `useFrame` that returns a `THREE.Texture`.
 *  setParams - A function to update the parameters, useful for performance tuning, etc.
 *  fxObject - An object containing various FX components such as scene, camera, material, and render target.
 *
 * @template T The type for the parameters of the hooks.
 * @template O The type for the FX object.
 */
export type HooksReturn<T, O> = [
   /**
    * An update function that returns THREE.Texture. Call it inside useFrame
    * @param props RootState
    * @param params params of hooks
    */
   (props: RootState, updateParams?: T, customPointer?: THREE.Vector2) => THREE.Texture,
   /**
    * Function to update params. It can be used for performance control, etc.
    * @param params params of hooks
    */
   (params: T) => void,
   /**
    * Contains each part of FX such as scene, camera, material, render target, etc.
    */
   O
];
