import * as THREE from "three";
import { MaterialProps, Size } from "../../types";
export declare class HSVMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_brightness: {
            value: number;
        };
        u_saturation: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, onBeforeInit, }: {
    scene: THREE.Scene;
    size: Size;
} & MaterialProps) => {
    material: HSVMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, HSVMaterial, THREE.Object3DEventMap>;
};
