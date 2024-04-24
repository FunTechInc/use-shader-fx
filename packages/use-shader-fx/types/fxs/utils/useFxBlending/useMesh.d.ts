import * as THREE from "three";
import { MaterialProps } from "../../types";
export declare class FxBlendingMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_map: {
            value: THREE.Texture;
        };
        u_mapIntensity: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: FxBlendingMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, FxBlendingMaterial>;
};
