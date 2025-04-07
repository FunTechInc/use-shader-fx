import * as THREE from "three";
import { DefaultUniforms } from "./FxMaterial";
import { NestUniformValues, UniformParentKey } from "../../shaders/uniformsUtils";
import type { Vec4Channel } from "../../libs/types";
/** 0:`fill` 1:`cover` 2:`contain` */
export type FitType = 0 | 1 | 2;
export type BasicFxUniformsUnique = {
    mixSrc: {
        value: UniformParentKey;
    };
    mixSrc_src: {
        value: THREE.Texture;
    };
    mixSrc_fit: {
        value: FitType;
    };
    mixSrc_uv: {
        value: UniformParentKey;
    };
    mixSrc_uv_ch: {
        value: Vec4Channel;
    };
    mixSrc_uv_factor: {
        value: number;
    };
    mixSrc_uv_offset: {
        value: THREE.Vector2;
    };
    mixSrc_uv_radius: {
        value: number;
    };
    mixSrc_uv_position: {
        value: THREE.Vector2;
    };
    mixSrc_uv_range: {
        value: THREE.Vector2;
    };
    mixSrc_uv_mixMap: {
        value: UniformParentKey;
    };
    mixSrc_uv_mixMap_src: {
        value: THREE.Texture;
    };
    mixSrc_uv_mixMap_ch: {
        value: Vec4Channel;
    };
    mixSrc_color: {
        value: UniformParentKey;
    };
    mixSrc_color_factor: {
        value: number;
    };
    mixSrc_color_radius: {
        value: number;
    };
    mixSrc_color_position: {
        value: THREE.Vector2;
    };
    mixSrc_color_range: {
        value: THREE.Vector2;
    };
    mixSrc_color_mixMap: {
        value: UniformParentKey;
    };
    mixSrc_color_mixMap_src: {
        value: THREE.Texture;
    };
    mixSrc_color_mixMap_ch: {
        value: Vec4Channel;
    };
    mixSrc_alpha: {
        value: UniformParentKey;
    };
    mixSrc_alpha_factor: {
        value: number;
    };
    mixSrc_alpha_radius: {
        value: number;
    };
    mixSrc_alpha_position: {
        value: THREE.Vector2;
    };
    mixSrc_alpha_range: {
        value: THREE.Vector2;
    };
    mixSrc_alpha_mixMap: {
        value: UniformParentKey;
    };
    mixSrc_alpha_mixMap_src: {
        value: THREE.Texture;
    };
    mixSrc_alpha_mixMap_ch: {
        value: Vec4Channel;
    };
    mixDst: {
        value: UniformParentKey;
    };
    mixDst_src: {
        value: THREE.Texture;
    };
    mixDst_fit: {
        value: FitType;
    };
    mixDst_uv: {
        value: UniformParentKey;
    };
    mixDst_uv_ch: {
        value: Vec4Channel;
    };
    mixDst_uv_factor: {
        value: number;
    };
    mixDst_uv_offset: {
        value: THREE.Vector2;
    };
    mixDst_uv_radius: {
        value: number;
    };
    mixDst_uv_position: {
        value: THREE.Vector2;
    };
    mixDst_uv_range: {
        value: THREE.Vector2;
    };
    mixDst_uv_mixMap: {
        value: UniformParentKey;
    };
    mixDst_uv_mixMap_src: {
        value: THREE.Texture;
    };
    mixDst_uv_mixMap_ch: {
        value: Vec4Channel;
    };
    mixDst_color: {
        value: UniformParentKey;
    };
    mixDst_color_factor: {
        value: number;
    };
    mixDst_color_radius: {
        value: number;
    };
    mixDst_color_position: {
        value: THREE.Vector2;
    };
    mixDst_color_range: {
        value: THREE.Vector2;
    };
    mixDst_color_mixMap: {
        value: UniformParentKey;
    };
    mixDst_color_mixMap_src: {
        value: THREE.Texture;
    };
    mixDst_color_mixMap_ch: {
        value: Vec4Channel;
    };
    mixDst_alpha: {
        value: UniformParentKey;
    };
    mixDst_alpha_factor: {
        value: number;
    };
    mixDst_alpha_radius: {
        value: number;
    };
    mixDst_alpha_position: {
        value: THREE.Vector2;
    };
    mixDst_alpha_range: {
        value: THREE.Vector2;
    };
    mixDst_alpha_mixMap: {
        value: UniformParentKey;
    };
    mixDst_alpha_mixMap_src: {
        value: THREE.Texture;
    };
    mixDst_alpha_mixMap_ch: {
        value: Vec4Channel;
    };
    levels: {
        value: UniformParentKey;
    };
    levels_shadows: {
        value: THREE.Vector4;
    };
    levels_midtones: {
        value: THREE.Vector4;
    };
    levels_highlights: {
        value: THREE.Vector4;
    };
    levels_outputMin: {
        value: THREE.Vector4;
    };
    levels_outputMax: {
        value: THREE.Vector4;
    };
    contrast: {
        value: UniformParentKey;
    };
    contrast_factor: {
        value: THREE.Vector4;
    };
    colorBalance: {
        value: UniformParentKey;
    };
    colorBalance_factor: {
        value: THREE.Vector3;
    };
    hsv: {
        value: UniformParentKey;
    };
    hsv_hueShift: {
        value: number;
    };
    hsv_saturation: {
        value: number;
    };
    hsv_brightness: {
        value: number;
    };
    posterize: {
        value: UniformParentKey;
    };
    posterize_levels: {
        value: THREE.Vector4;
    };
    grayscale: {
        value: UniformParentKey;
    };
    grayscale_weight: {
        value: THREE.Vector3;
    };
    grayscale_duotone: {
        value: UniformParentKey;
    };
    grayscale_duotone_color0: {
        value: THREE.Color;
    };
    grayscale_duotone_color1: {
        value: THREE.Color;
    };
    grayscale_threshold: {
        value: number;
    };
};
type BasicFxUniformsFitScale = {
    mixSrc_fitScale: {
        value: THREE.Vector2;
    };
    mixDst_fitScale: {
        value: THREE.Vector2;
    };
};
export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;
export type BasicFxValues = NestUniformValues<BasicFxUniforms>;
export type FxKey = {
    srcSystem: boolean;
    mixSrc: boolean;
    mixDst: boolean;
    levels: boolean;
    contrast: boolean;
    colorBalance: boolean;
    hsv: boolean;
    posterize: boolean;
    grayscale: boolean;
};
export type SrcSystemKey = "mixSrc" | "mixDst" | "texture";
export declare const BASICFX_VALUES: BasicFxUniformsUnique & BasicFxUniformsFitScale;
export declare function handleUpdateFxDefines(fxKey: FxKey): {
    [key: string]: any;
};
/** setterで定義される場合もあるため、valuesではなくuniformsから判定する */
export declare function getFxKeyFromUniforms(uniforms: BasicFxUniformsUnique): FxKey;
export {};
