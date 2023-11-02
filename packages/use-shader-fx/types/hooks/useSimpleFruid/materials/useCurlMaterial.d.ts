import * as THREE from "three";
type TUniforms = {
    resolution: {
        value: THREE.Vector2;
    };
    uVelocity: {
        value: THREE.Texture;
    };
};
export declare class CurlMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useCurlMaterial: () => CurlMaterial;
export {};
