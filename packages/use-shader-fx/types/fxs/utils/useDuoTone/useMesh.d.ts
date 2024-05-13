import * as THREE from "three";
import { MaterialProps } from "../../types";
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
export declare const useMesh: ({ scene, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: DuoToneMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, DuoToneMaterial, THREE.Object3DEventMap>;
};
