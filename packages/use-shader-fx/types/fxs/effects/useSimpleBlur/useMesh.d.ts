import * as THREE from "three";
import { MaterialProps } from "../../types";
export declare class SampleMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uResolution: {
            value: THREE.Vector2;
        };
        uBlurSize: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: SampleMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, SampleMaterial>;
};
