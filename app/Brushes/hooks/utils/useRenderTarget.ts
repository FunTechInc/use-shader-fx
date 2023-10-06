import * as THREE from "three";
import { useFBO } from "@react-three/drei";
import { useCallback, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

const FBO_OPTION = {
   depthBuffer: false,
   stencilBuffer: false,
};

export type TRenderTarget = {
   read: THREE.WebGLRenderTarget | null;
   write: THREE.WebGLRenderTarget | null;
   swap: () => void;
};

type TUpdateRenderTarget = (
   gl: THREE.WebGLRenderer,
   renderCallback: (fbo: TRenderTarget) => void
) => THREE.Texture;

/**
 * render targetを更新して、スワップしたFBテクスチャーを返す
 * updateRenderTargetはレンダーのタイミングで実行を制限したい場合があるので、
 * @returns [renderTarget,updateRenderTarget]
 * @param (gl,(fbo)=>void); 第2引数はFBOを受け取るレンダリング関数
 */
export const useRenderTarget = (): TUpdateRenderTarget => {
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
   renderTarget.current.swap();

   //resize
   const size = useThree((state) => state.size);
   useEffect(() => {
      renderTarget.current.read?.setSize(size.width, size.height);
      renderTarget.current.write?.setSize(size.width, size.height);
   }, [size]);

   const updateRenderTarget: TUpdateRenderTarget = useCallback(
      (gl, renderCallback) => {
         const fbo = renderTarget.current;
         gl.setRenderTarget(fbo.write);
         renderCallback(fbo);
         fbo.swap();
         gl.setRenderTarget(null);
         gl.clear();
         return fbo.read?.texture as THREE.Texture;
      },
      []
   );

   return updateRenderTarget;
};
