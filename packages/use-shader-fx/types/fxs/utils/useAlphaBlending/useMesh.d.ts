import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { MaterialProps } from "../../types";
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
export declare const useMesh: ({ scene, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
    size: Size;
} & MaterialProps) => {
    material: AlphaBlendingMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, AlphaBlendingMaterial>;
};
