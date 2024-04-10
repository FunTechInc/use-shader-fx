import * as THREE from "three";
import { HooksProps, HooksReturn } from "../../types";
export type ChromaKeyParams = {
    /** Process this texture with chroma key , default : `THREE.Texture` */
    texture?: THREE.Texture;
    /** key color for chromakey processing , default: `THREE.Color(0x00ff00)` */
    keyColor?: THREE.Color;
    /** If the similarity with the key color exceeds this value, it becomes transparent. , default : `0.2` */
    similarity?: number;
    /** smoothness , default : `0.1` */
    smoothness?: number;
    /** spill , default : `0.2` */
    spill?: number;
    /** tone correction , default : `THREE.Vector4(1.0, 1.0, 1.0, 1.0)` */
    color?: THREE.Vector4;
    /** contrast , default : `1.0` */
    contrast?: number;
    /** brightness , default : `0.0` */
    brightness?: number;
    /** gamma correction , default : `1.0` */
    gamma?: number;
};
export type ChromaKeyObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
};
export declare const CHROMAKEY_PARAMS: ChromaKeyParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useChromaKey: ({ size, dpr, samples, }: HooksProps) => HooksReturn<ChromaKeyParams, ChromaKeyObject>;
