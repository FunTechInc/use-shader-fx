import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FBO_OPTION, UseFboProps, renderFBO } from "./useSingleFBO";
import { useResolution } from "./useResolution";

export type DoubleRenderTarget = {
   read: THREE.WebGLRenderTarget | null;
   write: THREE.WebGLRenderTarget | null;
};

interface WebGLDoubleRenderTarget extends DoubleRenderTarget {
   swap: () => void;
}

type FBOUpdateFunction = (
   gl: THREE.WebGLRenderer,
   /**  call before FBO is rendered */
   onBeforeRender?: ({
      read,
      write,
   }: {
      read: THREE.Texture;
      write: THREE.Texture;
   }) => void
) => THREE.Texture;

type UseDoubleFBOReturn = [
   { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget },
   FBOUpdateFunction
];

/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @returns [{read:THREE.WebGLRenderTarget,write:THREE.WebGLRenderTarget} , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export const useDoubleFBO = ({
   scene,
   camera,
   size,
   dpr = false,
   isSizeUpdate = false,
   samples = 0,
   depthBuffer = false,
   depthTexture = false,
}: UseFboProps): UseDoubleFBOReturn => {
   const renderTarget = useRef<WebGLDoubleRenderTarget>({
      read: null,
      write: null,
      swap: function () {
         let temp = this.read;
         this.read = this.write;
         this.write = temp;
      },
   });

   const resolution = useResolution(size, dpr);

   const initRenderTargets = useMemo(() => {
      const read = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
         ...FBO_OPTION,
         samples,
         depthBuffer,
      });
      const write = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
         ...FBO_OPTION,
         samples,
         depthBuffer,
      });

      if (depthTexture) {
         read.depthTexture = new THREE.DepthTexture(
            resolution.x,
            resolution.y,
            THREE.FloatType
         );
         write.depthTexture = new THREE.DepthTexture(
            resolution.x,
            resolution.y,
            THREE.FloatType
         );
      }

      return { read, write };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   renderTarget.current.read = initRenderTargets.read;
   renderTarget.current.write = initRenderTargets.write;

   if (isSizeUpdate) {
      renderTarget.current.read?.setSize(resolution.x, resolution.y);
      renderTarget.current.write?.setSize(resolution.x, resolution.y);
   }

   useEffect(() => {
      const temp = renderTarget.current;
      return () => {
         temp.read?.dispose();
         temp.write?.dispose();
      };
   }, []);

   const updateRenderTarget: FBOUpdateFunction = useCallback(
      (gl, onBeforeRender) => {
         const fbo = renderTarget.current;
         renderFBO({
            gl,
            scene,
            camera,
            fbo: fbo.write!,
            onBeforeRender: () =>
               onBeforeRender &&
               onBeforeRender({
                  read: fbo.read!.texture,
                  write: fbo.write!.texture,
               }),
            onSwap: () => fbo.swap(),
         });
         return fbo.read?.texture as THREE.Texture;
      },
      [scene, camera]
   );

   return [
      { read: renderTarget.current.read, write: renderTarget.current.write },
      updateRenderTarget,
   ];
};
