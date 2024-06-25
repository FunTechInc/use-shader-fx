import * as THREE from "three";
import { MaterialProps, Size } from "../../types";
export declare class AlphaBlendingMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uMap: {
            value: THREE.Texture;
        };
    };
}
export declare const useMesh: ({ scene, onBeforeInit, }: {
    scene: THREE.Scene;
    size: Size;
} & MaterialProps) => {
    material: AlphaBlendingMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, AlphaBlendingMaterial, THREE.Object3DEventMap>;
};
