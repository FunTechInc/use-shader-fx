import * as THREE from "three";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useResolution } from "./useResolution";
import { UseFboProps } from "./types";

export const FBO_OPTION = {
   minFilter: THREE.LinearFilter,
   magFilter: THREE.LinearFilter,
   type: THREE.HalfFloatType,
   depthBuffer: false,
   stencilBuffer: false,
};

type FBOUpdateFunction = (
   gl: THREE.WebGLRenderer,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type Return = [THREE.WebGLRenderTarget, FBOUpdateFunction];

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
}: UseFboProps): Return => {
   const renderTarget = useRef<THREE.WebGLRenderTarget>();

   const resolution = useResolution(size, dpr);
   renderTarget.current = useMemo(
      () => new THREE.WebGLRenderTarget(resolution.x, resolution.y, FBO_OPTION),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
   );

   useLayoutEffect(() => {
      if (isSizeUpdate) {
         renderTarget.current?.setSize(resolution.x, resolution.y);
      }
   }, [resolution, isSizeUpdate]);

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
