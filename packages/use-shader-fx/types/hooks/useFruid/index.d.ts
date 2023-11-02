import * as THREE from "three";
import { FruidMaterials } from "./useMesh";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../utils/types";
export type FruidParams = {
    density_dissipation?: number;
    velocity_dissipation?: number;
    velocity_acceleration?: number;
    pressure_dissipation?: number;
    pressure_iterations?: number;
    curl_strength?: number;
    splat_radius?: number;
    fruid_color?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3;
};
export type FruidObject = {
    scene: THREE.Scene;
    materials: FruidMaterials;
    camera: THREE.Camera;
    renderTarget: {
        velocity: DoubleRenderTarget;
        density: DoubleRenderTarget;
        curl: THREE.WebGLRenderTarget;
        divergence: THREE.WebGLRenderTarget;
        pressure: DoubleRenderTarget;
    };
};
export declare const useFruid: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<FruidParams, FruidObject>;
