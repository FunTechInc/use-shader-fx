import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
type PressureUniforms = {
    bounce: {
        value: boolean;
    };
    deltaTime: {
        value: number;
    };
    pressure: {
        value: THREE.Texture;
    };
    velocity: {
        value: THREE.Texture;
    };
};
export type PressureValues = NestUniformValues<PressureUniforms>;
export type PressureValuesClient = Omit<PressureValues, "velocity" | "pressure">;
export declare class PressureMaterial extends FxMaterial {
    static get type(): string;
    uniforms: PressureUniforms;
    constructor(props: FxMaterialProps<PressureValues>);
}
export {};
