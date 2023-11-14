import * as THREE from "three";
type TUniforms = {
    uVelocity: {
        value: THREE.Texture;
    };
    texelSize: {
        value: THREE.Vector2;
    };
};
export declare class CurlMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useCurlMaterial: () => CurlMaterial;
export {};
