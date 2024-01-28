import * as THREE from "three";
import { FluidMaterials } from "./useMesh";
import { HooksProps, HooksReturn } from "../types";
import { DoubleRenderTarget } from "../../utils/useDoubleFBO";
export type FluidParams = {
    /** density disspation , default:0.98 */
    density_dissipation?: number;
    /** velocity dissipation , default:0.99 */
    velocity_dissipation?: number;
    /** velocity acceleration , default:10.0 */
    velocity_acceleration?: number;
    /** pressure dissipation , default:0.9 */
    pressure_dissipation?: number;
    /** pressure iterations. affects performance , default:20 */
    pressure_iterations?: number;
    /** curl_strength , default:35 */
    curl_strength?: number;
    /** splat radius , default:0.002 */
    splat_radius?: number;
    /** Fluid Color.THREE.Vector3 Alternatively, it accepts a function that returns THREE.Vector3.The function takes velocity:THREE.Vector2 as an argument. , default:THREE.Vector3(1.0, 1.0, 1.0) */
    fluid_color?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3;
};
export type FluidObject = {
    scene: THREE.Scene;
    materials: FluidMaterials;
    camera: THREE.Camera;
    renderTarget: {
        velocity: DoubleRenderTarget;
        density: DoubleRenderTarget;
        curl: THREE.WebGLRenderTarget;
        divergence: THREE.WebGLRenderTarget;
        pressure: DoubleRenderTarget;
    };
    output: THREE.Texture;
};
export declare const FLUID_PARAMS: FluidParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useFluid: ({ size, dpr, samples, }: HooksProps) => HooksReturn<FluidParams, FluidObject>;
