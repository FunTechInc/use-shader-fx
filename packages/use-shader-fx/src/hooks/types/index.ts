import * as THREE from "three";
import { FxBasicFxMaterial } from "../../materials/FxBasicFxMaterial";

export type Size = {
   width: number;
   height: number;
   top: number;
   left: number;
   updateStyle?: boolean;
};

export type Dpr =
   | number
   | {
        /** you can set whether `dpr` affects `shader`. default : `false` */
        shader?: false | number;
        /** you can set whether `dpr` affects `fbo`. default : `false` */
        fbo?: false | number;
     };

export type RootState = {
   /** The instance of the renderer */
   gl: THREE.WebGLRenderer;
   /** Default clock */
   clock: THREE.Clock;
   /** Normalized event coordinates */
   pointer: THREE.Vector2;
   /** Reactive pixel-size of the canvas */
   size: Size;
};

export interface HooksProps {
   /** Width,Height in pixels, or `size` from r3f */
   size: Size;
   /** Pixel-ratio, use `window.devicePixelRatio` or viewport.dpr from r3f */
   dpr: Dpr;
   /** Whether to `setSize` the FBO when updating size or dpr. default : `false` */
   sizeUpdate?: boolean;
   /**
    * @type `THREE.RenderTargetOptions`
    * @param depthBuffer Unlike the default in three.js, the default is `false`.
    */
   renderTargetOptions?: THREE.RenderTargetOptions;
   materialParameters?: THREE.ShaderMaterialParameters;
}

/**
 * @returns {HooksReturn<T, O, C>}
 *  render - Functions to update parameters and render.
 *  setValues - Function to update parameters only.
 *  texture - テクスチャー
 *  material - material
 *  scene - scene
 *
 * @template V The type for the FX parameters.
 * @template O The type for the material.
 */
export type HooksReturn<V = {}, M = FxBasicFxMaterial> = {
   /**
    * Functions to update parameters and render.
    * @param rootState RootState
    * @param newValues params of fxHooks
    */
   render: (rootState: RootState, newValues?: V) => THREE.Texture;
   /**
    * Function to update parameters only.
    * @param newValues params of fxHooks
    */
   setValues: (newValues: V) => void;
   texture: THREE.Texture;
   material: M;
   scene: THREE.Scene;
   camera: THREE.Camera;
};
