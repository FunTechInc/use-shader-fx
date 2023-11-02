import * as THREE from "three";
import { VelocityMaterial } from "./materials/useVelocityMaterial";
import { AdvectionMaterial } from "./materials/useAdvectionMaterial";
import { DivergenceMaterial } from "./materials/useDivergenceMaterial";
import { PressureMaterial } from "./materials/usePressureMaterial";
import { Size } from "@react-three/fiber";
type TMaterials = VelocityMaterial | AdvectionMaterial | DivergenceMaterial | PressureMaterial;
export type SimpleFruidMaterials = {
    velocityMaterial: VelocityMaterial;
    advectionMaterial: AdvectionMaterial;
    divergenceMaterial: DivergenceMaterial;
    pressureMaterial: PressureMaterial;
};
type TUseMeshReturnType = [
    SimpleFruidMaterials,
    (material: TMaterials) => void
];
export declare const useMesh: ({ scene, size, }: {
    scene: THREE.Scene;
    size: Size;
}) => TUseMeshReturnType;
export {};
