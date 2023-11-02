import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type FogProjectionParams = {
    texture?: THREE.Texture;
    timeStrength?: number;
    distortionStrength?: number;
    fogEdge0?: number;
    fogEdge1?: number;
    fogColor?: THREE.Color;
    noiseOct?: number;
    fbmOct?: number;
};
export type FogProjectionObject = {
    scene: THREE.Scene;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const useFogProjection: ({ size, }: {
    size: Size;
}) => HooksReturn<FogProjectionParams, FogProjectionObject>;
