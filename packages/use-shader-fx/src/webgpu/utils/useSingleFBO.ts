import * as THREE from "three/webgpu";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useResolution } from "./useResolution";
import { Size } from "../fxs/types";

export type UseFboProps = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   size: Size;
   /** If dpr is set, dpr will be multiplied, default : `false` */
   dpr?: number | false;
   /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default : `false` */
   sizeUpdate?: boolean;
   /** If set, the scene depth will be rendered into buffer.depthTexture. default : `false` */
   depth?: boolean;
} & THREE.RenderTargetOptions;

export const renderFBO = ({
   gl,
   fbo,
   scene,
   camera,
   onBeforeRender,
   onSwap,
}: {
   gl: THREE.WebGPURenderer;
   fbo: THREE.WebGLRenderTarget;
   scene: THREE.Scene;
   camera: THREE.Camera;
   onBeforeRender: () => void;
   onSwap?: () => void;
}) => {
   gl.setRenderTarget(fbo);
   onBeforeRender();
   gl.clear();
   gl.render(scene, camera);
   onSwap && onSwap();
   gl.setRenderTarget(null);
   gl.clear();
};

type UpdateRenderTarget = (
   gl: THREE.WebGPURenderer,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type UseSingleFBOReturn = [THREE.WebGLRenderTarget, UpdateRenderTarget];

/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param sizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @param depthBuffer Unlike the default in three.js, the default is `false`.
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export const useSingleFBO = (props: UseFboProps): UseSingleFBOReturn => {
   const {
      scene,
      camera,
      size,
      dpr = false,
      sizeUpdate = false,
      depth = false,
      ...renderTargetOptions
   } = props;

   const renderTarget = useRef<THREE.WebGLRenderTarget>();

   const resolution = useResolution(size, dpr);

   renderTarget.current = useMemo(
      () => {
         const target = new THREE.WebGLRenderTarget(
            resolution.x,
            resolution.y,
            {
               ...renderTargetOptions,
            }
         );
         if (depth) {
            target.depthTexture = new THREE.DepthTexture(
               resolution.x,
               resolution.y,
               THREE.FloatType
            );
         }
         return target;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
   );

   if (sizeUpdate) {
      renderTarget.current?.setSize(resolution.x, resolution.y);
   }

   useEffect(() => {
      const temp = renderTarget.current;
      return () => {
         temp?.dispose();
      };
   }, []);

   const updateRenderTarget: UpdateRenderTarget = useCallback(
      (gl, onBeforeRender) => {
         const fbo = renderTarget.current!;
         renderFBO({
            gl,
            fbo,
            scene,
            camera,
            onBeforeRender: () =>
               onBeforeRender && onBeforeRender({ read: fbo.texture }),
         });
         return fbo.texture;
      },
      [scene, camera]
   );

   return [renderTarget.current, updateRenderTarget];
};
