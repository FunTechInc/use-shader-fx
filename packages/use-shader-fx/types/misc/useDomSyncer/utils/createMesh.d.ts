import * as THREE from "three";
import { DomSyncerParams } from "../";
import { Size } from "@react-three/fiber";
import { MaterialProps } from "../../../fxs/types";
export declare class DomSyncerMaterial extends THREE.ShaderMaterial {
    uniforms: {
        u_texture: {
            value: THREE.Texture;
        };
        u_textureResolution: {
            value: THREE.Vector2;
        };
        u_resolution: {
            value: THREE.Vector2;
        };
        u_borderRadius: {
            value: number;
        };
    };
}
export declare const createMesh: ({ params, size, scene, onBeforeCompile, }: {
    params: DomSyncerParams;
    size: Size;
    scene: THREE.Scene;
} & MaterialProps) => void;
