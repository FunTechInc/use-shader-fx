import * as THREE from "three";
import { Size } from "@react-three/fiber";
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
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
}) => {
    material: AlphaBlendingMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, AlphaBlendingMaterial>;
};
