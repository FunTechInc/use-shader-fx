import * as THREE from "three";
export declare class NoiseMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTime: {
            value: number;
        };
        scale: {
            value: number;
        };
        timeStrength: {
            value: number;
        };
        noiseOctaves: {
            value: number;
        };
        fbmOctaves: {
            value: number;
        };
        warpOctaves: {
            value: number;
        };
        warpDirection: {
            value: THREE.Vector2;
        };
        warpStrength: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => {
    material: NoiseMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, NoiseMaterial>;
};
