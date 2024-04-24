import * as THREE from "three";
import { MaterialProps } from "../../../types";
export declare class AdvectionMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uVelocity: {
            value: THREE.Texture;
        };
        uSource: {
            value: THREE.Texture;
        };
        texelSize: {
            value: THREE.Vector2;
        };
        dt: {
            value: number;
        };
        dissipation: {
            value: number;
        };
    };
}
export declare const useAdvectionMaterial: ({ onBeforeCompile }: MaterialProps) => AdvectionMaterial;
