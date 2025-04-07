import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "../../../materials/core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
type SplatUniforms = {
    forceBias: {
        value: number;
    };
    radius: {
        value: THREE.Vector2;
    };
    force: {
        value: THREE.Vector2;
    };
    center: {
        value: THREE.Vector2;
    };
};
export type SplatValues = NestUniformValues<SplatUniforms>;
export type SplatValuesClient = Omit<SplatValues, "force" | "center">;
export declare class SplatMaterial extends FxMaterial {
    static get type(): string;
    uniforms: SplatUniforms;
    constructor(props: FxMaterialProps);
}
export {};
