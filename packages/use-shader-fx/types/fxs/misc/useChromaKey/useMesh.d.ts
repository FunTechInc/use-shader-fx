import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare class ChromaKeyMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_resolution: {
            value: THREE.Vector2;
        };
        u_keyColor: {
            value: THREE.Color;
        };
        u_similarity: {
            value: number;
        };
        u_smoothness: {
            value: number;
        };
        u_spill: {
            value: number;
        };
        u_color: {
            value: THREE.Vector4;
        };
        u_contrast: {
            value: number;
        };
        u_brightness: {
            value: number;
        };
        u_gamma: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number;
}) => {
    material: ChromaKeyMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material>;
};
