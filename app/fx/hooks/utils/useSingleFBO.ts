import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";

export const FBO_OPTION = {
   minFilter: THREE.LinearFilter,
   magFilter: THREE.LinearFilter,
   type: THREE.HalfFloatType,
   depthBuffer: false,
   stencilBuffer: false,
};

type UpdateFBO = (
   gl: THREE.WebGLRenderer,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type Return = [target: THREE.WebGLRenderTarget, updateFBO: UpdateFBO];

/**
 * @param isSizeUpdate - Whether to update renderTarget size when dpr and size change, default:true
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export const useSingleFBO = (
   scene: THREE.Scene,
   camera: THREE.Camera,
   isSizeUpdate = true
): Return => {
   const renderTarget = useRef<THREE.WebGLRenderTarget>();

   const size = useThree((state) => state.size);
   const viewport = useThree((state) => state.viewport);
   const _width = size.width * viewport.dpr;
   const _height = size.height * viewport.dpr;

   renderTarget.current = useMemo(
      () => new THREE.WebGLRenderTarget(_width, _height, FBO_OPTION),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
   );
   useEffect(() => {
      isSizeUpdate && renderTarget.current?.setSize(_width, _height);
   }, [_width, _height, isSizeUpdate]);

   const updateRenderTarget: UpdateFBO = useCallback(
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
