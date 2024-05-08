import * as THREE from "three";
import { MaterialProps } from "../../../types";
export declare class PressureMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uPressure: {
            value: THREE.Texture;
        };
        uDivergence: {
            value: THREE.Texture;
        };
        texelSize: {
            value: THREE.Vector2;
        };
    };
}
export declare const usePressureMaterial: ({ onBeforeCompile, uniforms, }: MaterialProps) => PressureMaterial;
