import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useResolution } from "./useResolution";
import { Size } from "@react-three/fiber";

export const FBO_DEFAULT_OPTION: THREE.RenderTargetOptions = {
   depthBuffer: false,
};

export type UseFboProps = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   size: Size;
   /** If dpr is set, dpr will be multiplied, default : `false` */
   dpr?: number | false;
   /** Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default : `false` */
   isSizeUpdate?: boolean;
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
   gl: THREE.WebGLRenderer;
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
   gl: THREE.WebGLRenderer,
   /**  call before FBO is rendered */
   onBeforeRender?: ({ read }: { read: THREE.Texture }) => void
) => THREE.Texture;

type UseSingleFBOReturn = [THREE.WebGLRenderTarget, UpdateRenderTarget];

/**
 * @param dpr If dpr is set, dpr will be multiplied, default:false
 * @param isSizeUpdate Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false
 * @returns [THREE.WebGLRenderTarget , updateFBO] -Receives the RenderTarget as the first argument and the update function as the second argument.
 */
export const useSingleFBO = (props: UseFboProps): UseSingleFBOReturn => {
   const {
      scene,
      camera,
      size,
      dpr = false,
      isSizeUpdate = false,
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

   if (isSizeUpdate) {
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
