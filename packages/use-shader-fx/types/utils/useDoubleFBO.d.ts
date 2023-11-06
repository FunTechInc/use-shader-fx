import * as THREE from "three";
import { UseFboProps } from "./types";
type FBOUpdateFunction = (gl: THREE.WebGLRenderer, 
/**  call before FBO is rendered */
onBeforeRender?: ({ read, write, }: {
    read: THREE.Texture;
    write: THREE.Texture;
}) => void) => THREE.Texture;
type Return = [
    {
        read: THREE.WebGLRenderTarget;
        write: THREE.WebGLRenderTarget;
    },
    FBOUpdateFunction
];
/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @returns [{read:THREE.WebGLRenderTarget,write:THREE.WebGLRenderTarget} , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export declare const useDoubleFBO: ({ scene, camera, size, dpr, isSizeUpdate, }: UseFboProps) => Return;
export {};
