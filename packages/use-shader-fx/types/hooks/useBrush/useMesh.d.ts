import * as THREE from "three";
import { Size } from "@react-three/fiber";
type TUniforms = {
    uMap: {
        value: THREE.Texture;
    };
    uResolution: {
        value: THREE.Texture;
    };
    uAspect: {
        value: number;
    };
    uTexture: {
        value: THREE.Texture;
    };
    uRadius: {
        value: number;
    };
    uSmudge: {
        value: number;
    };
    uDissipation: {
        value: number;
    };
    uMotionBlur: {
        value: number;
    };
    uMotionSample: {
        value: number;
    };
    uMouse: {
        value: number;
    };
    uPrevMouse: {
        value: number;
    };
    uVelocity: {
        value: number;
    };
    uColor: {
        value: THREE.Color;
    };
};
export declare class BrushMaterial extends THREE.ShaderMaterial {
    uniforms: TUniforms;
}
export declare const useMesh: ({ scene, size, dpr, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number;
}) => BrushMaterial;
export {};
