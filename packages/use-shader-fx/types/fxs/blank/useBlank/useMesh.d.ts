import * as THREE from "three";
import { MaterialProps } from "../../types";
import { Size } from "@react-three/fiber";
export declare class BlankMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uBackbuffer: {
            value: THREE.Texture;
        };
        uTime: {
            value: number;
        };
        uPointer: {
            value: THREE.Vector2;
        };
        uResolution: {
            value: THREE.Vector2;
        };
    };
}
export declare const useMesh: ({ scene, size, dpr, onBeforeInit, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
} & MaterialProps) => {
    material: BlankMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, BlankMaterial, THREE.Object3DEventMap>;
};
