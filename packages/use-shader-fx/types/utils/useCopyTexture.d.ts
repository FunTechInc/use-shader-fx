import * as THREE from "three";
import { UseFboProps } from "./useSingleFBO";
type UpdateCopyFunction = (gl: THREE.WebGLRenderer, index: number, 
/**  call before FBO is rendered */
onBeforeRender?: ({ read }: {
    read: THREE.Texture;
}) => void) => THREE.Texture;
type UseCopyTextureReturn = [THREE.WebGLRenderTarget[], UpdateCopyFunction];
/**
 * Generate an FBO array to copy the texture.
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @param length The number of FBOs to create
 * @returns [THREE.WebGLRenderTarget[] , updateCopyTexture] -Receives the RenderTarget array as the first argument and the update function as the second argument. updateCopyTexture() receives gl as the first argument and the index of the texture you want to copy as the second argument.
 */
export declare const useCopyTexture: ({ scene, camera, size, dpr, isSizeUpdate, samples, depthBuffer, depthTexture, }: UseFboProps, length: number) => UseCopyTextureReturn;
export {};
