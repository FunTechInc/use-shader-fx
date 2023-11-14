import * as THREE from "three";
import { Size } from "@react-three/fiber";
type TUniforms = {
    uResolution: {
        value: THREE.Vector2;
    };
    uImageResolution: {
        value: THREE.Vector2;
    };
    uTexture0: {
        value: THREE.Texture;
    };
    uTexture1: {
        value: THREE.Texture;
    };
    uNoiseMap: {
        value: THREE.Texture;
    };
    noiseStrength: {
        value: number;
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
export declare class TransitionBgMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number;
}) => TransitionBgMaterial;
export {};
