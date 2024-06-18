import * as THREE from "three";
import { FluidMaterials, CustomFluidProps, CustomFluidParams } from "./useMesh";
import { PointerValues } from "../../../misc/usePointer";
import { HooksProps, HooksReturn } from "../../types";
import { DoubleRenderTarget } from "../../../utils/useDoubleFBO";
export declare const DELTA_TIME = 0.016;
export type FluidParams = {
    /** density disspation , default : `0.98` */
    densityDissipation?: number;
    /** velocity dissipation , default : `0.99` */
    velocityDissipation?: number;
    /** velocity acceleration , default : `10.0` */
    velocityAcceleration?: number;
    /** pressure dissipation , default : `0.9` */
    pressureDissipation?: number;
    /** pressure iterations. affects performance , default : `20` */
    pressureIterations?: number;
    /** curl_strength , default : `35` */
    curlStrength?: number;
    /** splat radius , default : `0.002` */
    splatRadius?: number;
    /** Fluid Color.THREE.Vector3 Alternatively, it accepts a function that returns THREE.Vector3.The function takes velocity:THREE.Vector2 as an argument. , default : `THREE.Vector3(1.0, 1.0, 1.0)` */
    fluidColor?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3 | THREE.Color;
    /** When calling usePointer in a frame loop, setting PointerValues ​​to this value prevents double calls , default : `false` */
    pointerValues?: PointerValues | false;
};
export type FluidObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
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
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useFluid: ({ size, dpr, renderTargetOptions, isSizeUpdate, customFluidProps, }: {
    /** you can add `onBeforeInit` of the next material.`initial`,`curl`,`vorticity`,`advection`,`divergence`,`pressure`,`clear`,`gradientSubtract`,`splat`
      * ```ts
      * customFluidProps: {
          vorticity: {
             onBeforeInit: (parameters) => console.log(parameters),
          },
       },
      * ```
     */
    customFluidProps?: CustomFluidProps | undefined;
} & HooksProps) => HooksReturn<FluidParams, FluidObject, CustomFluidParams>;
