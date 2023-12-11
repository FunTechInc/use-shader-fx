import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { errorHandler } from "./utils/errorHandler";
import { createMesh } from "./utils/createMesh";
import { useIntersectionHandler } from "./utils/useIntersectionHandler";
import { updateRect } from "./utils/updateRect";
import { useIsIntersecting, IsIntersecting } from "./utils/useIsIntersecting";

export type DomSyncerParams = {
   texture?: THREE.Texture[];
   dom?: (HTMLElement | Element | null)[];
   resolution?: THREE.Vector2[];
   boderRadius?: number[];
};

export type DomSyncerObject = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   /**
    * The syncing DOM also returns a crossing decision.
    * @param index - Index of the dom for which you want to return an intersection decision. -1 will return the entire array.
    * @param once - If set to true, it will continue to return true once crossed.
    */
   isIntersecting: IsIntersecting;
};

export const DOMSYNCER_PARAMS: DomSyncerParams = {
   texture: [],
   dom: [],
   resolution: [],
   boderRadius: [],
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useDomSyncer = (
   {
      size,
      dpr,
   }: {
      size: Size;
      dpr: number;
   },
   dependencies: React.DependencyList = []
): HooksReturn<DomSyncerParams, DomSyncerObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
   });
   const [params, setParams] = useParams<DomSyncerParams>(DOMSYNCER_PARAMS);

   // Avoid instancing vec2 every frame
   const resolutionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

   // Update monitored doms according to the dependency array
   const [refreshTrigger, setRefreshTrigger] = useState(true);
   useEffect(() => {
      setRefreshTrigger(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, dependencies);

   const intersectionHandler = useIntersectionHandler();
   const { isIntersectingOnceRef, isIntersectingRef, isIntersecting } =
      useIsIntersecting();

   const updateFx = useCallback(
      (props: RootState, updateParams?: DomSyncerParams) => {
         const { gl, size } = props;

         updateParams && setParams(updateParams);

         errorHandler(params);

         if (refreshTrigger) {
            createMesh({
               params,
               size,
               scene,
            });

            intersectionHandler({
               isIntersectingRef,
               isIntersectingOnceRef,
               params,
            });

            setRefreshTrigger(false);
         }

         updateRect({
            params,
            size,
            resolutionRef,
            scene,
            isIntersectingRef,
         });

         return updateRenderTarget(gl);
      },
      [
         updateRenderTarget,
         setParams,
         intersectionHandler,
         refreshTrigger,
         scene,
         params,
         isIntersectingOnceRef,
         isIntersectingRef,
      ]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         camera: camera,
         renderTarget: renderTarget,
         isIntersecting: isIntersecting,
      },
   ];
};
