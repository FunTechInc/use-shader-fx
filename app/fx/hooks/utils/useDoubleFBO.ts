import * as THREE from "three";
import { useFBO } from "@react-three/drei";
import { useCallback, useEffect, useRef } from "react";
import { useResolution } from "./useResolution";

const FBO_OPTION = {
   depthBuffer: false,
   stencilBuffer: false,
};

export type TRenderTarget = {
   read: THREE.WebGLRenderTarget | null;
   write: THREE.WebGLRenderTarget | null;
   swap: () => void;
};

type TUpdateFBO = (
   gl: THREE.WebGLRenderer,
   onBeforeRender?: ({
      read,
      write,
   }: {
      read: THREE.Texture;
      write: THREE.Texture;
   }) => void
) => THREE.Texture;

/**
 * render targetを更新して、スワップしたFBテクスチャーを返す
 * updateRenderTargetはレンダーのタイミングで実行を制限したい場合があるので、
 * @returns [renderTarget,updateRenderTarget]
 * @param (gl,(fbo)=>void); 第2引数はFBOを受け取るレンダリング関数
 */
export const useDoubleFBO = (
   scene: THREE.Scene,
   camera: THREE.Camera
): TUpdateFBO => {
   const renderTarget = useRef<TRenderTarget>({
      read: null,
      write: null,
      swap: function () {
         let temp = this.read;
         this.read = this.write;
         this.write = temp;
      },
   });

   //set FBO
   renderTarget.current.read = useFBO(FBO_OPTION);
   renderTarget.current.write = useFBO(FBO_OPTION);

   //resize
   const resolution = useResolution();
   useEffect(() => {
      // must be called in useEffect
      renderTarget.current.read?.setSize(resolution.x, resolution.y);
      renderTarget.current.write?.setSize(resolution.x, resolution.y);
   }, [resolution]);

   const updateRenderTarget: TUpdateFBO = useCallback(
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

   return updateRenderTarget;
};
