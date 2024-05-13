import * as THREE from "three";
import { MaterialProps } from "../../types";
export declare class CosPaletteMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uRgbWeight: {
            value: THREE.Vector3;
        };
        uColor1: {
            value: THREE.Color;
        };
        uColor2: {
            value: THREE.Color;
        };
        uColor3: {
            value: THREE.Color;
        };
        uColor4: {
            value: THREE.Color;
        };
    };
}
export declare const useMesh: ({ scene, uniforms, onBeforeCompile, }: {
    scene: THREE.Scene;
} & MaterialProps) => {
    material: CosPaletteMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, CosPaletteMaterial, THREE.Object3DEventMap>;
};
