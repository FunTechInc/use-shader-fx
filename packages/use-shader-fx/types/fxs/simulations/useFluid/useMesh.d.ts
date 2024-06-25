import * as THREE from "three";
import { AdvectionMaterial } from "./materials/useAdvectionMaterial";
import { DivergenceMaterial } from "./materials/useDivergenceMaterial";
import { PressureMaterial } from "./materials/usePressureMaterial";
import { CurlMaterial } from "./materials/useCurlMaterial";
import { VorticityMaterial } from "./materials/useVorticityMaterial";
import { ClearMaterial } from "./materials/useClearMaterial";
import { GradientSubtractMaterial } from "./materials/useGradientSubtractMaterial";
import { SplatMaterial } from "./materials/useSplatMaterial";
import { CustomParams } from "../../../utils/setUniforms";
import { MaterialProps, Size } from "../../types";
type TMaterials = AdvectionMaterial | DivergenceMaterial | CurlMaterial | PressureMaterial | ClearMaterial | GradientSubtractMaterial | SplatMaterial;
export type FluidMaterials = {
    vorticityMaterial: VorticityMaterial;
    curlMaterial: CurlMaterial;
    advectionMaterial: AdvectionMaterial;
    divergenceMaterial: DivergenceMaterial;
    pressureMaterial: PressureMaterial;
    clearMaterial: ClearMaterial;
    gradientSubtractMaterial: GradientSubtractMaterial;
    splatMaterial: SplatMaterial;
};
export type CustomizableKeys = "advection" | "splat" | "curl" | "vorticity" | "divergence" | "clear" | "pressure" | "gradientSubtract";
export type CustomFluidProps = {
    [K in CustomizableKeys]?: MaterialProps;
};
export type CustomFluidParams = {
    [K in CustomizableKeys]?: CustomParams;
};
/**
 * Returns the material update function in the second argument
 */
export declare const useMesh: ({ scene, size, dpr, customFluidProps, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
    customFluidProps?: CustomFluidProps | undefined;
}) => {
    materials: {
        vorticityMaterial: VorticityMaterial;
        curlMaterial: CurlMaterial;
        advectionMaterial: AdvectionMaterial;
        divergenceMaterial: DivergenceMaterial;
        pressureMaterial: PressureMaterial;
        clearMaterial: ClearMaterial;
        gradientSubtractMaterial: GradientSubtractMaterial;
        splatMaterial: SplatMaterial;
    };
    setMeshMaterial: (material: TMaterials) => void;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.ShaderMaterial, THREE.Object3DEventMap>;
};
export {};
