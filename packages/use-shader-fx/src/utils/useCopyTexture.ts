import * as THREE from "three";
import {
   useCallback,
   useEffect,
   useLayoutEffect,
   useMemo,
   useRef,
} from "react";
import { useResolution } from "./useResolution";
import { UseFboProps } from "./useSingleFBO";
import { FBO_OPTION } from "./useSingleFBO";

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
   { scene, camera, size, dpr = false, isSizeUpdate = false }: UseFboProps,
   length: number
): UseCopyTextureReturn => {
   const renderTarget = useRef<THREE.WebGLRenderTarget[]>([]);
   const resolution = useResolution(size, dpr);

   renderTarget.current = useMemo(() => {
      return Array.from(
         { length },
         () =>
            new THREE.WebGLRenderTarget(resolution.x, resolution.y, FBO_OPTION)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [length]);

   useLayoutEffect(() => {
      if (isSizeUpdate) {
         renderTarget.current.forEach((fbo) =>
            fbo.setSize(resolution.x, resolution.y)
         );
      }
   }, [resolution, isSizeUpdate]);

   useEffect(() => {
      const currentRenderTarget = renderTarget.current;
      return () => {
         currentRenderTarget.forEach((fbo) => fbo.dispose());
      };
   }, [length]);

   const updateCopyTexture: UpdateCopyFunction = useCallback(
      (gl, index, onBeforeRender) => {
         const fbo = renderTarget.current[index];
         gl.setRenderTarget(fbo);
         onBeforeRender && onBeforeRender({ read: fbo.texture });
         gl.render(scene, camera);
         gl.setRenderTarget(null);
         gl.clear();
         return fbo.texture;
      },
      [scene, camera]
   );

   return [renderTarget.current, updateCopyTexture];
};
