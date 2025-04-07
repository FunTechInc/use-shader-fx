import * as THREE from "three";
import { ShaderWithUniforms } from "../../shaders/uniformsUtils";
export type DefaultUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    texelSize: {
        value: THREE.Vector2;
    };
    aspectRatio: {
        value: number;
    };
    maxAspect: {
        value: THREE.Vector2;
    };
    renderCount: {
        value: number;
    };
};
export type FxMaterialProps<T = {}> = {
    uniformValues?: T;
    materialParameters?: THREE.ShaderMaterialParameters;
    customParameters?: {
        [key: string]: any;
    };
} & ShaderWithUniforms;
export declare class FxMaterial extends THREE.ShaderMaterial {
    static readonly key: string;
    constructor({ uniformValues, materialParameters, uniforms, vertexShader, fragmentShader, }?: FxMaterialProps);
    /** This is updated in useFxScene */
    updateResolution(width: number, height: number): void;
    protected _setupShaders(vertexShader?: string, fragmentShader?: string): void;
    setUniformValues(values?: {
        [key: string]: any;
    }): Record<string, any> | undefined;
    /** define getter/setters　*/
    protected _defineUniformAccessors(onSet?: () => void): void;
}
