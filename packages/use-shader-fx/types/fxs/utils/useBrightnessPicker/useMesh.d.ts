import * as THREE from "three";
import { MaterialProps } from "../../types";
export declare class BrightnessPickerMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
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
    };
}
export declare const useMesh: ({ scene, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: BrightnessPickerMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, BrightnessPickerMaterial, THREE.Object3DEventMap>;
};
