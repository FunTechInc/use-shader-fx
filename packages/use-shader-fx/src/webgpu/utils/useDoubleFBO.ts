import * as THREE from "three/webgpu";
import { useCallback, useEffect, useMemo } from "react";
import { UseFboProps, renderFBO } from "./useSingleFBO";
import { useResolution } from "./useResolution";

export type DoubleRenderTarget = {
   read: THREE.WebGLRenderTarget;
   write: THREE.WebGLRenderTarget;
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
 * @description Custom hook for setting up double buffering with WebGL render targets.
 * @param UseFboProps same as `useSingleFBO`
 */
export const useDoubleFBO = (props: UseFboProps): UseDoubleFBOReturn => {
   const {
      scene,
      camera,
      size,
      dpr = false,
      sizeUpdate = false,
      depth = false,
      ...renderTargetOptions
   } = props;

   const resolution = useResolution(size, dpr);

   const renderTarget = useMemo<WebGLDoubleRenderTarget>(() => {
      const read = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
         ...renderTargetOptions,
      });
      const write = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
         ...renderTargetOptions,
      });

      if (depth) {
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

      return {
         read: read,
         write: write,
         swap: function () {
            let temp = this.read;
            this.read = this.write;
            this.write = temp;
         },
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (sizeUpdate) {
      renderTarget.read?.setSize(resolution.x, resolution.y);
      renderTarget.write?.setSize(resolution.x, resolution.y);
   }

   useEffect(() => {
      const temp = renderTarget;
      return () => {
         temp.read?.dispose();
         temp.write?.dispose();
      };
   }, [renderTarget]);

   const updateRenderTarget: FBOUpdateFunction = useCallback(
      (gl, onBeforeRender) => {
         const fbo = renderTarget;
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
      [scene, camera, renderTarget]
   );

   return [
      { read: renderTarget.read, write: renderTarget.write },
      updateRenderTarget,
   ];
};
