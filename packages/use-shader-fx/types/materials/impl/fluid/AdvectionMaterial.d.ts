import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
type AdvectionUniforms = {
    dissipation: {
        value: number;
    };
    deltaTime: {
        value: number;
    };
    velocity: {
        value: THREE.Texture;
    };
};
export type AdvectionValues = NestUniformValues<AdvectionUniforms>;
export type AdvectionValuesClient = Omit<AdvectionValues, "velocity">;
export declare class AdvectionMaterial extends FxMaterial {
    static get type(): string;
    uniforms: AdvectionUniforms;
    constructor(props: FxMaterialProps<AdvectionValues>);
}
export {};
