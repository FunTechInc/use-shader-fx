import * as THREE from "three";
import { FxMaterialProps } from "./FxMaterial";
import { NestUniformValues, UniformParentKey } from "../../shaders/uniformsUtils";
import { BasicFxMaterial } from "./BasicFxMaterial";
import * as BasicFxLib from "./BasicFxLib";
type SamplingFxUniformsUnique = {
    texture: {
        value: UniformParentKey;
    };
    texture_src: {
        value: THREE.Texture;
    };
    texture_fit: {
        value: BasicFxLib.FitType;
    };
};
export type SamplingFxUniforms = SamplingFxUniformsUnique & BasicFxLib.BasicFxUniforms;
export type SamplingFxValues = NestUniformValues<SamplingFxUniforms>;
/**
 * SamplingFxMaterialでは常にtextureはtrueであるはずなので、BasicFxMaterialを継承して、srcSystemは常にtrueになるように、継承する
 */
export declare class SamplingFxMaterial extends BasicFxMaterial {
    uniforms: SamplingFxUniforms;
    constructor({ uniforms, ...rest }: FxMaterialProps<SamplingFxValues>);
    protected _handleMergeShaderLib(vertexShader?: string, fragmentShader?: string): [string | undefined, string | undefined];
    protected _isContainsBasicFxValues(values?: {
        [key: string]: any;
    }): boolean;
    protected _updateFitScale(): void;
    protected _setupFxKey(uniforms: BasicFxLib.BasicFxUniforms): BasicFxLib.FxKey;
    protected _handleUpdateFxShaders(): {
        diffCount: number;
        newFxKey: BasicFxLib.FxKey;
    };
    protected _handleUpdateFxDefines(): {
        [key: string]: any;
    };
}
export {};
