import * as THREE from "three";
import { MaterialProps } from "../../types";
export declare class WaveMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uEpicenter: {
            value: THREE.Vector2;
        };
        uProgress: {
            value: number;
        };
        uStrength: {
            value: number;
        };
        uWidth: {
            value: number;
        };
        uMode: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: WaveMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, WaveMaterial>;
};
