import * as THREE from "three";
import { MaterialProps } from "../../types";
export declare class BlendingMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        uMap: {
            value: THREE.Texture;
        };
        u_alphaMap: {
            value: THREE.Texture;
        };
        u_isAlphaMap: {
            value: boolean;
        };
        uMapIntensity: {
            value: number;
        };
        u_brightness: {
            value: THREE.Vector3;
        };
        u_min: {
            value: number;
        };
        u_max: {
            value: number;
        };
        u_dodgeColor: {
            value: THREE.Color;
        };
        u_isDodgeColor: {
            value: boolean;
        };
    };
}
export declare const useMesh: ({ scene, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: BlendingMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, BlendingMaterial, THREE.Object3DEventMap>;
};
