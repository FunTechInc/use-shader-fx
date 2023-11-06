import * as THREE from "three";
import { DuoToneMaterial } from "./useMesh";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
export type DuoToneParams = {
    texture?: THREE.Texture;
    color0?: THREE.Color;
    color1?: THREE.Color;
};
export type DuoToneObject = {
    scene: THREE.Scene;
    material: DuoToneMaterial;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
};
export declare const useDuoTone: ({ size, }: {
    size: Size;
}) => HooksReturn<DuoToneParams, DuoToneObject>;
