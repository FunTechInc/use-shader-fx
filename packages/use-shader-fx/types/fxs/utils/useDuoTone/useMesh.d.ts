import * as THREE from "three";
export declare class DuoToneMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uColor0: {
            value: THREE.Color;
        };
        uColor1: {
            value: THREE.Color;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => {
    material: DuoToneMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, DuoToneMaterial>;
};
