import * as THREE from "three";
type TUniforms = {
    uTexture: {
        value: THREE.Texture;
    };
    value: {
        value: number;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class ClearMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useClearMaterial: () => ClearMaterial;
export {};
