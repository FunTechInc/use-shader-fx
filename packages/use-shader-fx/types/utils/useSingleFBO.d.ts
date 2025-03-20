import * as THREE from "three";
import { Size } from "../hooks/types";
export declare const FBO_DEFAULT_OPTION: THREE.RenderTargetOptions;
export type UseFboProps = {
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    size: Size;
    /** If dpr is set, dpr will be multiplied, default : `false` */
    dpr?: number | false;
    /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default : `false` */
    fboAutoSetSize?: boolean;
    /** If set, the scene depth will be rendered into buffer.depthTexture. default : `false` */
    depth?: boolean;
} & THREE.RenderTargetOptions;
export type RenderProps = {
    gl: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    clear?: boolean;
};
export declare const renderFBO: ({ gl, fbo, scene, camera, clear, onBeforeRender, onSwap, }: {
    fbo: THREE.WebGLRenderTarget;
    onBeforeRender: () => void;
    onSwap?: () => void;
} & RenderProps) => void;
export type SingleFBOUpdateFunction = (renderProps: RenderProps, 
/**  call before FBO is rendered */
onBeforeRender?: ({ read }: {
    read: THREE.Texture;
}) => void) => THREE.Texture;
type UseSingleFBOReturn = [THREE.WebGLRenderTarget, SingleFBOUpdateFunction];
/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param fboAutoSetSize Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @param depthBuffer Unlike the default in three.js, the default is `false`.
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export declare const useSingleFBO: (props: UseFboProps) => UseSingleFBOReturn;
export {};
