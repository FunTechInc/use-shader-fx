import * as THREE from "three";
import { useFBO } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { FBO_OPTION } from "./useSingleFBO";

export type TRenderTarget = {
   read: THREE.WebGLRenderTarget | null;
   write: THREE.WebGLRenderTarget | null;
   swap: () => void;
};

type UpdateFBO = (
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

type Return = [
   target: { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget },
   updateFBO: UpdateFBO
];

/**
 * @param  isSizeUpdate - Whether to update renderTarget size when dpr and size change, default:true
 * @returns [{read:THREE.WebGLRenderTarget,write:THREE.WebGLRenderTarget} , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export const useDoubleFBO = (
   scene: THREE.Scene,
   camera: THREE.Camera,
   isSizeUpdate = true
): Return => {
   const renderTarget = useRef<TRenderTarget>({
      read: null,
      write: null,
      swap: function () {
         let temp = this.read;
         this.read = this.write;
         this.write = temp;
      },
   });

   const size = useThree((state) => state.size);
   const viewport = useThree((state) => state.viewport);
   const _width = size.width * viewport.dpr;
   const _height = size.height * viewport.dpr;

   renderTarget.current.read = useMemo(
      () => new THREE.WebGLRenderTarget(_width, _height, FBO_OPTION),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
   );
   useEffect(() => {
      isSizeUpdate && renderTarget.current.read?.setSize(_width, _height);
   }, [_width, _height, isSizeUpdate]);

   renderTarget.current.write = useFBO(FBO_OPTION);

   const updateRenderTarget: UpdateFBO = useCallback(
      (gl, onBeforeRender) => {
         const fbo = renderTarget.current;
         gl.setRenderTarget(fbo.write);
         onBeforeRender &&
            onBeforeRender({
               read: fbo.read!.texture,
               write: fbo.write!.texture,
            });
         gl.render(scene, camera);
         fbo.swap();
         gl.setRenderTarget(null);
         gl.clear();
         return fbo.read?.texture as THREE.Texture;
      },
      [scene, camera]
   );

   return [
      { read: renderTarget.current.read, write: renderTarget.current.write },
      updateRenderTarget,
   ];
};
