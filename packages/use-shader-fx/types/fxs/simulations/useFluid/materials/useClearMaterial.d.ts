import * as THREE from "three";
import { MaterialProps } from "../../../types";
export declare class ClearMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        value: {
            value: number;
        };
        texelSize: {
            value: THREE.Vector2;
        };
    };
}
export declare const useClearMaterial: ({ onBeforeInit }: MaterialProps) => ClearMaterial;
