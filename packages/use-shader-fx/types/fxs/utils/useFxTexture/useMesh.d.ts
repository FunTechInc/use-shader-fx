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
        uTexture0: {
            value: THREE.Texture;
        };
        uTexture1: {
            value: THREE.Texture;
        };
        padding: {
            value: number;
        };
        uMap: {
            value: THREE.Texture;
        };
        edgeIntensity: {
            value: number;
        };
        mapIntensity: {
            value: number;
        };
        epicenter: {
            value: THREE.Vector2;
        };
        progress: {
            value: number;
        };
        dirX: {
            value: number;
        };
        dirY: {
            value: number;
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
