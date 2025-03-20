import * as THREE from "three";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { ExtractUniformValues, NestUniformValues } from "../../../shaders/uniformsUtils";
type NoiseUniforms = {
    /** useBeatを渡せば、リズムを変えられる。 */
    tick: {
        value: number;
    };
    /** noise scale , default : `0.004` */
    scale: {
        value: number;
    };
    /** time factor default : `0.3` */
    timeStrength: {
        value: number;
    };
    /** noiseOctaves, affects performance default : `2` */
    noiseOctaves: {
        value: number;
    };
    /** fbmOctaves, affects performance default : `2` */
    fbmOctaves: {
        value: number;
    };
    /** domain warping octaves , affects performance default : `2`  */
    warpOctaves: {
        value: number;
    };
    /** direction of domain warping , default : `(2.0,2,0)` */
    warpDirection: {
        value: THREE.Vector2;
    };
    /** strength of domain warping , default : `8.0` */
    warpStrength: {
        value: number;
    };
    /** offset of the time */
    timeOffset: {
        value: number;
    };
} & BasicFxUniforms;
export type NoiseValues = NestUniformValues<NoiseUniforms> & BasicFxValues;
export type NoiseMaterialProps = ExtractUniformValues<NoiseUniforms>;
export declare class NoiseMaterial extends BasicFxMaterial {
    static readonly key: string;
    static get type(): string;
    uniforms: NoiseUniforms;
    constructor(props?: FxMaterialProps<NoiseValues>);
}
export {};
