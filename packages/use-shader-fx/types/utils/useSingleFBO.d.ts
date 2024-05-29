import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare const FBO_DEFAULT_OPTION: THREE.RenderTargetOptions;
export type UseFboProps = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    size: Size;
    /** If dpr is set, dpr will be multiplied, default : `false` */
    dpr?: number | false;
    /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default : `false` */
    isSizeUpdate?: boolean;
    /** If set, the scene depth will be rendered into buffer.depthTexture. default : `false` */
    depth?: boolean;
} & THREE.RenderTargetOptions;
export declare const renderFBO: ({ gl, fbo, scene, camera, onBeforeRender, onSwap, }: {
    gl: THREE.WebGLRenderer;
    fbo: THREE.WebGLRenderTarget;
    scene: THREE.Scene;
    camera: THREE.Camera;
    onBeforeRender: () => void;
    onSwap?: (() => void) | undefined;
}) => void;
type UpdateRenderTarget = (gl: THREE.WebGLRenderer, 
/**  call before FBO is rendered */
onBeforeRender?: ({ read }: {
    read: THREE.Texture;
}) => void) => THREE.Texture;
type UseSingleFBOReturn = [THREE.WebGLRenderTarget, UpdateRenderTarget];
/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export declare const useSingleFBO: (props: UseFboProps) => UseSingleFBOReturn;
export {};
