import * as THREE from "three";
export declare class MotionBlurMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uBackbuffer: {
            value: THREE.Texture;
        };
        uBegin: {
            value: THREE.Vector2;
        };
        uEnd: {
            value: THREE.Vector2;
        };
        uStrength: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => {
    material: MotionBlurMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, MotionBlurMaterial>;
};
