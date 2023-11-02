import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type TransitionBgParams = {
    texture0?: THREE.Texture;
    texture1?: THREE.Texture;
    imageResolution?: THREE.Vector2;
    noise?: THREE.Texture;
    noiseStrength?: number;
    progress?: number;
    dir?: THREE.Vector2;
};
export type TransitionBgObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const useTransitionBg: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<TransitionBgParams, TransitionBgObject>;
