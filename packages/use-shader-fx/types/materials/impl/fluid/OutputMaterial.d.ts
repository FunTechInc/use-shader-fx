import * as THREE from "three";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
type OutputUniforms = {
    src: {
        value: THREE.Texture;
    };
} & BasicFxUniforms;
export type OutputValues = NestUniformValues<OutputUniforms> & BasicFxValues;
export declare class OutputMaterial extends BasicFxMaterial {
    static get type(): string;
    uniforms: OutputUniforms;
    constructor(props?: FxMaterialProps<OutputValues>);
}
export {};
