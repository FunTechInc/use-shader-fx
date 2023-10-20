import * as THREE from "three";
import { useFBO } from "@react-three/drei";
import { useCallback, useEffect, useRef } from "react";
import { useResolution } from "./useResolution";

const FBO_OPTION = {
   depthBuffer: false,
   stencilBuffer: false,
};

type TUpdateFBO = (
   gl: THREE.WebGLRenderer,
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

/**
 * render targetを更新して、スワップしたFBテクスチャーを返す
 * updateRenderTargetはレンダーのタイミングで実行を制限したい場合があるので、
 * @returns [renderTarget,updateRenderTarget]
 * @param (gl,(fbo)=>void); 第2引数はFBOを受け取るレンダリング関数
 */
export const useSingleFBO = (
   scene: THREE.Scene,
   camera: THREE.Camera
): TUpdateFBO => {
   const renderTarget = useRef<THREE.WebGLRenderTarget>();

   //set FBO
   renderTarget.current = useFBO(FBO_OPTION);

   //resize
   const resolution = useResolution();
   useEffect(() => {
      renderTarget.current?.setSize(resolution.x, resolution.y);
   }, [resolution]);

   const updateRenderTarget: TUpdateFBO = useCallback(
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

   return updateRenderTarget;
};
