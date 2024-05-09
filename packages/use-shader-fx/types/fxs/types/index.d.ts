import * as THREE from "three";
import { RootState, Size } from "@react-three/fiber";
export type Dpr = number | {
    /** you can set whether `dpr` affects `shader`. default : `false` */
    shader?: false | number;
    /** you can set whether `dpr` affects `fbo`. default : `false` */
    fbo?: false | number;
};
export type MaterialProps = {
    /** It is possible to add your own uniforms - they are not added to the GLSL and must be replace with `onBeforeCompile` */
    uniforms?: {
        [uniform: string]: THREE.IUniform<any>;
    };
    /**
     * An optional callback that is executed immediately before the shader program is compiled.
     * @param shader — Source code of the shader
     * @param renderer — WebGLRenderer Context that is initializing the material
     */
    onBeforeCompile?: (shader: THREE.Shader, renderer: THREE.WebGLRenderer) => void;
};
export interface HooksProps extends MaterialProps {
    size: Size;
    dpr: Dpr;
    /** Defines the count of MSAA samples. Can only be used with WebGL 2. default : `0` */
    samples?: number;
    /** Whether to `setSize` the FBO when updating size or dpr. default : `false` */
    isSizeUpdate?: boolean;
}
/**
 * @returns {HooksReturn<T, O, C>}
 *  updateFx - Functions to update parameters and render.
 *  updateParams - Function to update parameters only.
 *  fxObject - An object containing various FX components such as scene, camera, material, and render target.
 *
 * @template T The type for the parameters of the hooks.
 * @template O The type for the FX object.
 * @template C The type for the custom parameters.
 */
export type HooksReturn<T, O, C> = [
    /**
     * Functions to update parameters and render.
     * @param rootState RootState
     * @param newParams params of fxHooks
     * @param customParams custom params, added to `uniforms` during initialisation
     */
    (rootState: RootState, newParams?: T, customParams?: C) => THREE.Texture,
    /**
     * Function to update parameters only.
     * @param newParams params of fxHooks
     * @param customParams custom params, added to `uniforms` during initialisation
     */
    (newParams?: T, customParams?: C) => void,
    /**
     * Contains each part of FX such as scene, camera, material, render target, etc.
     */
    O
];
