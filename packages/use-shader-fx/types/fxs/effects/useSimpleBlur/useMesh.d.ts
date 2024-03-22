import * as THREE from "three";
export declare class SampleMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uResolution: {
            value: THREE.Vector2;
        };
        uBlurSize: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => {
    material: SampleMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, SampleMaterial>;
};
