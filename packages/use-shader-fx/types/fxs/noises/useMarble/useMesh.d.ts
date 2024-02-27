import * as THREE from "three";
export declare class MarbleMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_time: {
            value: number;
        };
        u_pattern: {
            value: number;
        };
        u_complexity: {
            value: number;
        };
        u_complexityAttenuation: {
            value: number;
        };
        u_iterations: {
            value: number;
        };
        u_timeStrength: {
            value: number;
        };
        u_scale: {
            value: number;
        };
    };
}
export declare const useMesh: (scene: THREE.Scene) => MarbleMaterial;
