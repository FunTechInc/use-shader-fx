import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
type DivergenceUniforms = {
    bounce: {
        value: boolean;
    };
    deltaTime: {
        value: number;
    };
    velocity: {
        value: THREE.Texture;
    };
};
export type DivergenceValues = NestUniformValues<DivergenceUniforms>;
export type DivergenceValuesClient = Omit<DivergenceValues, "velocity">;
export declare class DivergenceMaterial extends FxMaterial {
    static get type(): string;
    uniforms: DivergenceUniforms;
    constructor(props: FxMaterialProps<DivergenceValues>);
}
export {};
