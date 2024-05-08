import * as THREE from "three";
export declare const rewriteFragmentShader: (mapArray: THREE.Texture[] | undefined, fragmentShader: string) => {
    rewritedFragmentShader: string;
    mapArrayUniforms: any;
};
