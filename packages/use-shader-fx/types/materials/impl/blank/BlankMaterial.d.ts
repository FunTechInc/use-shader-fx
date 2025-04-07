import * as THREE from "three";
import { DefaultUniforms, FxMaterial, FxMaterialProps } from "../../core/FxMaterial";
type BlankUniforms = {
    time: {
        value: number;
    };
    pointer: {
        value: THREE.Vector2;
    };
    backbuffer: {
        value: THREE.Texture;
    };
} & DefaultUniforms;
export declare class BlankMaterial extends FxMaterial {
    static get type(): string;
    uniforms: BlankUniforms;
    constructor({ vertexShader, fragmentShader, uniforms, ...rest }: FxMaterialProps);
}
export {};
