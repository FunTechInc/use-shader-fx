import * as THREE from "three";
import {
   useCallback,
   useEffect,
   useLayoutEffect,
   useMemo,
   useRef,
} from "react";
import { useResolution } from "./useResolution";
import { Size } from "@react-three/fiber";

export const FBO_OPTION: THREE.RenderTargetOptions = {
   minFilter: THREE.LinearFilter,
   magFilter: THREE.LinearFilter,
   type: THREE.HalfFloatType,
   stencilBuffer: false,
};

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
   /** Renders to the depth buffer. Default is false. */
   depthBuffer?: boolean;
};

type FBOUpdateFunction = (
   gl: THREE.WebGLRenderer,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type UseSingleFBOReturn = [THREE.WebGLRenderTarget, FBOUpdateFunction];

/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export const useSingleFBO = ({
   scene,
   camera,
   size,
   dpr = false,
   isSizeUpdate = false,
   samples = 0,
   depthBuffer = false,
}: UseFboProps): UseSingleFBOReturn => {
   const renderTarget = useRef<THREE.WebGLRenderTarget>();

   const resolution = useResolution(size, dpr);
   renderTarget.current = useMemo(
      () =>
         new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
            ...FBO_OPTION,
            samples,
            depthBuffer,
         }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
   );

   useLayoutEffect(() => {
      if (isSizeUpdate) {
         renderTarget.current?.setSize(resolution.x, resolution.y);
      }
   }, [resolution, isSizeUpdate]);

   useEffect(() => {
      const currentRenderTarget = renderTarget.current;
      return () => {
         currentRenderTarget?.dispose();
      };
   }, []);

   const updateRenderTarget: FBOUpdateFunction = useCallback(
      (gl, onBeforeRender) => {
         const fbo = renderTarget.current!;
         gl.setRenderTarget(fbo);
         onBeforeRender && onBeforeRender({ read: fbo.texture });
         gl.render(scene, camera);
         gl.setRenderTarget(null);
         gl.clear();
         return fbo.texture;
      },
      [scene, camera]
   );

   return [renderTarget.current, updateRenderTarget];
};
