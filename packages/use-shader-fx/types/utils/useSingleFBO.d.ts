import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare const FBO_OPTION: THREE.RenderTargetOptions;
export type UseFboProps = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    size: Size;
    /** If dpr is set, dpr will be multiplied, default:false */
    dpr?: number | false;
    /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false */
    isSizeUpdate?: boolean;
    /** Defines the count of MSAA samples. Can only be used with WebGL 2. Default is 0. */
    samples?: number;
    /** Renders to the depth buffer. Unlike the three.js,　Default is false. */
    depthBuffer?: boolean;
    /** If set, the scene depth will be rendered to this texture. Default is false. */
    depthTexture?: boolean;
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
export declare const useSingleFBO: ({ scene, camera, size, dpr, isSizeUpdate, samples, depthBuffer, depthTexture, }: UseFboProps) => UseSingleFBOReturn;
export {};
