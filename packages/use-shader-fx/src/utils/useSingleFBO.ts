import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useResolution } from "./useResolution";
import { Size } from "../fxs/types";

export const FBO_DEFAULT_OPTION: THREE.RenderTargetOptions = {
   depthBuffer: false,
};

export type UseFboProps = {
   scene?: THREE.Scene;
   camera?: THREE.Camera;
   size: Size;
   /** If dpr is set, dpr will be multiplied, default : `false` */
   dpr?: number | false;
   /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default : `false` */
   sizeUpdate?: boolean;
   /** If set, the scene depth will be rendered into buffer.depthTexture. default : `false` */
   depth?: boolean;
} & THREE.RenderTargetOptions;

export type RenderProps = {
   gl: THREE.WebGLRenderer;
   scene?: THREE.Scene;
   camera?: THREE.Camera;
   clear?: boolean;
};

export const renderFBO = ({
   gl,
   fbo,
   scene,
   camera,
   clear = true,
   onBeforeRender,
   onSwap,
}: {
   fbo: THREE.WebGLRenderTarget;
   onBeforeRender: () => void;
   onSwap?: () => void;
} & RenderProps) => {
   if (!scene || !camera) return;
   const clearCache = gl.autoClear;
   gl.autoClear = clear;
   gl.setRenderTarget(fbo);
   onBeforeRender();
   gl.render(scene, camera);
   onSwap && onSwap();
   gl.setRenderTarget(null);
   gl.autoClear = clearCache;
};

export type SingleFBOUpdateFunction = (
   renderProps: RenderProps,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type UseSingleFBOReturn = [THREE.WebGLRenderTarget, SingleFBOUpdateFunction];

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
               ...FBO_DEFAULT_OPTION,
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

   const updateRenderTarget: SingleFBOUpdateFunction = useCallback(
      (renderProps, onBeforeRender) => {
         const fbo = renderTarget.current!;
         renderFBO({
            ...renderProps,
            scene: renderProps.scene || scene,
            camera: renderProps.camera || camera,
            fbo,
            onBeforeRender: () => onBeforeRender?.({ read: fbo.texture }),
         });
         return fbo.texture;
      },
      [scene, camera]
   );

   return [renderTarget.current, updateRenderTarget];
};
