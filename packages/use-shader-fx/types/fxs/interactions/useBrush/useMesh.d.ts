import * as THREE from "three";
import { Size } from "@react-three/fiber";
import { MaterialProps } from "../../types";
export declare class BrushMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uBuffer: {
            value: THREE.Texture;
        };
        uTexture: {
            value: THREE.Texture;
        };
        uIsTexture: {
            value: boolean;
        };
        uMap: {
            value: THREE.Texture;
        };
        uIsMap: {
            value: boolean;
        };
        uMapIntensity: {
            value: number;
        };
        uResolution: {
            value: THREE.Vector2;
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
            value: THREE.Vector3 | THREE.Color;
        };
        uIsCursor: {
            value: boolean;
        };
        uPressureStart: {
            value: number;
        };
        uPressureEnd: {
            value: number;
        };
    };
}
export declare const useMesh: ({ scene, size, dpr, onBeforeInit, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
} & MaterialProps) => {
    material: BrushMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, BrushMaterial, THREE.Object3DEventMap>;
};
