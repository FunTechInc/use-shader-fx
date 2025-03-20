import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import * as BasicFxLib from "./BasicFxLib";
export declare class BasicFxMaterial extends FxMaterial {
    fxKey: BasicFxLib.FxKey;
    uniforms: BasicFxLib.BasicFxUniforms;
    programCache: number;
    constructor({ uniforms, vertexShader, fragmentShader, ...rest }?: FxMaterialProps<BasicFxLib.BasicFxValues>);
    private _setupFxShaders;
    /** SamplingFxMaterialで継承するため、handlerとして独立させる */
    protected _handleMergeShaderLib(vertexShader?: string, fragmentShader?: string): [string | undefined, string | undefined];
    private _updateFxShaders;
    /** SamplingFxMaterialで継承するため、handlerとして独立させる */
    protected _handleUpdateFxShaders(): {
        diffCount: number;
        newFxKey: BasicFxLib.FxKey;
    };
    private _updateFxDefines;
    /** SamplingFxMaterialで継承するため、handlerとして独立させる */
    protected _handleUpdateFxDefines(): {
        [key: string]: any;
    };
    protected _isContainsBasicFxValues(target?: {
        [key: string]: any;
    }, source?: {
        [key: string]: any;
    }): boolean;
    protected _setupFxKey(uniforms: BasicFxLib.BasicFxUniforms): BasicFxLib.FxKey;
    private _calcFitScale;
    protected _setFitScale(key: BasicFxLib.SrcSystemKey): void;
    protected _updateFitScale(): void;
    /**
     * @param needsUpdate default : `true`
     */
    setUniformValues(values?: {
        [key: string]: any;
    }, needsUpdate?: boolean): Record<string, any> | undefined;
    protected _defineUniformAccessors(onSet?: () => void): void;
    updateResolution(width: number, height: number): void;
}
