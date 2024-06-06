import * as THREE from "three";
import { UseFboProps } from "./useSingleFBO";
export type DoubleRenderTarget = {
    read: THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;
};
type FBOUpdateFunction = (gl: THREE.WebGLRenderer, 
/**  call before FBO is rendered */
onBeforeRender?: ({ read, write, }: {
    read: THREE.Texture;
    write: THREE.Texture;
}) => void) => THREE.Texture;
type UseDoubleFBOReturn = [
    {
        read: THREE.WebGLRenderTarget;
        write: THREE.WebGLRenderTarget;
    },
    FBOUpdateFunction
];
/**
 * @description Custom hook for setting up double buffering with WebGL render targets.
 * @param UseFboProps same as `useSingleFBO`
 */
export declare const useDoubleFBO: (props: UseFboProps) => UseDoubleFBOReturn;
export {};
