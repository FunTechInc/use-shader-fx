import * as THREE from "three";
import { useCallback, useEffect, useState } from "react";
import {
   FBO_DEFAULT_OPTION,
   UseFboProps,
   renderFBO,
   RenderProps,
} from "./useSingleFBO";
import { useResolution } from "./useResolution";

export type DoubleRenderTarget = {
   read: THREE.WebGLRenderTarget;
   write: THREE.WebGLRenderTarget;
};

interface WebGLDoubleRenderTarget extends DoubleRenderTarget {
   swap: () => void;
}

export type DoubleFBOUpdateFunction = (
   renderProps: RenderProps,
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
   DoubleFBOUpdateFunction
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

   const [renderTarget] = useState<WebGLDoubleRenderTarget>(() => {
      const read = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
         ...FBO_DEFAULT_OPTION,
         ...renderTargetOptions,
      });
      const write = new THREE.WebGLRenderTarget(resolution.x, resolution.y, {
         ...FBO_DEFAULT_OPTION,
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
   });

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

   const updateRenderTarget: DoubleFBOUpdateFunction = useCallback(
      (renderProps, onBeforeRender) => {
         const fbo = renderTarget;
         renderFBO({
            ...renderProps,
            scene: renderProps.scene || scene,
            camera: renderProps.camera || camera,
            fbo: fbo.write!,
            onBeforeRender: () =>
               onBeforeRender?.({
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
