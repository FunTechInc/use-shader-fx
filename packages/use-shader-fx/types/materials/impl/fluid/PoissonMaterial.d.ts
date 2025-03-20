import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
type PoissonUniforms = {
    bounce: {
        value: boolean;
    };
    pressure: {
        value: THREE.Texture;
    };
    divergence: {
        value: THREE.Texture;
    };
};
export type PoissonValues = NestUniformValues<PoissonUniforms>;
export type PoissonValuesClient = Omit<PoissonValues, "pressure" | "divergence">;
export declare class PoissonMaterial extends FxMaterial {
    static get type(): string;
    uniforms: PoissonUniforms;
    iterations: number;
    constructor({ customParameters, ...rest }: FxMaterialProps<PoissonValues>);
}
export {};
