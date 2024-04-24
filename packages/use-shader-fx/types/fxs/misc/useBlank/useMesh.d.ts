import * as THREE from "three";
import { MaterialProps } from "../../types";
import { Size } from "@react-three/fiber";
export declare class BlankMaterial extends THREE.ShaderMaterial {
    uniforms: {
        uTexture: {
            value: THREE.Texture;
        };
        uBackbuffer: {
            value: THREE.Texture;
        };
        uTime: {
            value: number;
        };
        uPointer: {
            value: THREE.Vector2;
        };
        uResolution: {
            value: THREE.Vector2;
        };
    };
}
export type CustomUniforms = {
    uniforms?: {
        [uniform: string]: THREE.IUniform<any>;
    };
};
export declare const useMesh: ({ scene, size, dpr, onBeforeCompile, uniforms, }: {
    scene: THREE.Scene;
    size: Size;
    dpr: number | false;
} & MaterialProps & CustomUniforms) => {
    material: BlankMaterial;
    mesh: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, BlankMaterial>;
};
