import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { MaterialProps } from "../../types";
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
export declare const useMesh: ({ scene, size, dpr, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
} & MaterialProps) => {
    material: FxTextureMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, FxTextureMaterial>;
};
