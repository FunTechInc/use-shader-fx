import * as THREE from "three";
import { MaterialProps, Size } from "../../types";
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
export declare const useMesh: ({ scene, size, dpr, onBeforeInit, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
} & MaterialProps) => {
    material: FxTextureMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, FxTextureMaterial, THREE.Object3DEventMap>;
};
