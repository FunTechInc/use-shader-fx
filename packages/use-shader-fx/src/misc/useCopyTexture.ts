import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useResolution } from "../utils/useResolution";
import { UseFboProps, renderFBO, FBO_OPTION } from "../utils/useSingleFBO";

type UpdateCopyFunction = (
   gl: THREE.WebGLRenderer,
   index: number,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type UseCopyTextureReturn = [THREE.WebGLRenderTarget[], UpdateCopyFunction];

/**
 * Generate an FBO array to copy the texture.
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @param length The number of FBOs to create
 * @returns [THREE.WebGLRenderTarget[] , updateCopyTexture] -Receives the RenderTarget array as the first argument and the update function as the second argument. updateCopyTexture() receives gl as the first argument and the index of the texture you want to copy as the second argument.
 */
export const useCopyTexture = (
   {
      scene,
      camera,
      size,
      dpr = false,
      isSizeUpdate = false,
      samples = 0,
      depthBuffer = false,
      depthTexture = false,
   }: UseFboProps,
   length: number
): UseCopyTextureReturn => {
   const renderTargetArr = useRef<THREE.WebGLRenderTarget[]>([]);
   const resolution = useResolution(size, dpr);

   renderTargetArr.current = useMemo(() => {
      return Array.from({ length }, () => {
         const target = new THREE.WebGLRenderTarget(
            resolution.x,
            resolution.y,
            {
               ...FBO_OPTION,
               samples,
               depthBuffer,
            }
         );
         if (depthTexture) {
            target.depthTexture = new THREE.DepthTexture(
               resolution.x,
               resolution.y,
               THREE.FloatType
            );
         }
         return target;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [length]);

   if (isSizeUpdate) {
      renderTargetArr.current.forEach((fbo) =>
         fbo.setSize(resolution.x, resolution.y)
      );
   }

   useEffect(() => {
      const temp = renderTargetArr.current;
      return () => {
         temp.forEach((fbo) => fbo.dispose());
      };
   }, [length]);

   const updateCopyTexture: UpdateCopyFunction = useCallback(
      (gl, index, onBeforeRender) => {
         const fbo = renderTargetArr.current[index];
         renderFBO({
            gl,
            scene,
            camera,
            fbo,
            onBeforeRender: () =>
               onBeforeRender && onBeforeRender({ read: fbo.texture }),
         });
         return fbo.texture;
      },
      [scene, camera]
   );

   return [renderTargetArr.current, updateCopyTexture];
};
