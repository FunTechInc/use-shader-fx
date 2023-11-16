import * as THREE from "three";
import { UseFboProps } from "./types";
export declare const FBO_OPTION: {
    minFilter: 1006;
    magFilter: 1006;
    type: 1016;
    depthBuffer: boolean;
    stencilBuffer: boolean;
};
type FBOUpdateFunction = (gl: THREE.WebGLRenderer, 
/**  call before FBO is rendered */
onBeforeRender?: ({ read }: {
    read: THREE.Texture;
}) => void) => THREE.Texture;
type UseSingleFBOReturn = [THREE.WebGLRenderTarget, FBOUpdateFunction];
/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export declare const useSingleFBO: ({ scene, camera, size, dpr, isSizeUpdate, }: UseFboProps) => UseSingleFBOReturn;
export {};
