import * as THREE from "three";
import { MaterialProps } from "../../../types";
export declare class DivergenceMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uVelocity: {
            value: THREE.Texture;
        };
        texelSize: {
            value: THREE.Vector2;
        };
    };
}
export declare const useDivergenceMaterial: ({ onBeforeInit }: MaterialProps) => DivergenceMaterial;
