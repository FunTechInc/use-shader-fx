import * as THREE from "three";
import { SamplingFxUniforms, SamplingFxValues, SamplingFxMaterial } from "../../core/SamplingFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { ExtractUniformValues, NestUniformValues, UniformParentKey } from "../../../shaders/uniformsUtils";
type GridUniforms = {
    /** グリッドのマス数 */
    count: {
        value: THREE.Vector2;
    };
    /** 自動で画面のアスペクト比に合わせて正方形にscaleする */
    autoScale: {
        value: boolean;
    };
    /** tick */
    tick: {
        value: number;
    };
    shuffle: {
        value: UniformParentKey;
    };
    shuffle_frequency: {
        value: number;
    };
    shuffle_range: {
        value: number;
    };
    /** スプライトテクスチャ */
    sprite: {
        value: UniformParentKey;
    };
    sprite_src: {
        value: THREE.Texture;
    };
    sprite_length: {
        value: number;
    };
    sprite_shuffleSpeed: {
        value: number;
    };
} & SamplingFxUniforms;
export type GridValues = NestUniformValues<GridUniforms> & SamplingFxValues;
export type GridMaterialProps = ExtractUniformValues<GridUniforms>;
export declare class GridMaterial extends SamplingFxMaterial {
    static get type(): string;
    uniforms: GridUniforms;
    constructor(props: FxMaterialProps<GridValues>);
    /** When gridding with floor, you must use NearestFilter. */
    setNearestFilter(): void;
}
export {};
