import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare class FxTextureMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uResolution: {
            value: THREE.Vector2;
        };
        uTextureResolution: {
            value: THREE.Vector2;
        };
        uTexture: {
            value: THREE.Texture;
        };
    };
}
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number;
}) => {
    material: FxTextureMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, FxTextureMaterial>;
};
