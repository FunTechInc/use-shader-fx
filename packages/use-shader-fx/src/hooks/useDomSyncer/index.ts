import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { errorHandler } from "./utils/errorHandler";
import { createMesh } from "./utils/createMesh";
import { useIntersectionHandler } from "./utils/useIntersectionHandler";
import { useUpdateDomRect } from "./utils/useUpdateDomRect";
import { useIsIntersecting, IsIntersecting } from "./utils/useIsIntersecting";

export type DomSyncerParams = {
   /** DOM array you want to synchronize */
   dom?: (HTMLElement | Element | null)[];
   /** Texture array that you want to synchronize with the DOM rectangle */
   texture?: THREE.Texture[];
   /** Texture resolution array to pass */
   resolution?: THREE.Vector2[];
   /** default:0.0[] */
   boderRadius?: number[];
   /** the angle you want to rotate */
   rotation?: THREE.Euler[];
   /** Array of callback functions when crossed */
   onIntersect?: ((entry: IntersectionObserverEntry) => void)[];
};

export type DomSyncerObject = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   /**
    * A function that returns a determination whether the DOM intersects or not.
    * The boolean will be updated after executing the onIntersect function.
    * @param index - Index of the dom for which you want to return an intersection decision. -1 will return the entire array.
    * @param once - If set to true, it will continue to return true once crossed.
    */
   isIntersecting: IsIntersecting;
   /** Returns the target's DOMRect[] */
   DOMRects: DOMRect[];
};

export const DOMSYNCER_PARAMS: DomSyncerParams = {
   texture: [],
   dom: [],
   resolution: [],
   boderRadius: [],
   rotation: [],
   onIntersect: [],
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useDomSyncer = (
   { size, dpr, samples = 0 }: HooksProps,
   dependencies: React.DependencyList = []
): HooksReturn<DomSyncerParams, DomSyncerObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
      isSizeUpdate: true,
   });
   const [params, setParams] = useParams<DomSyncerParams>(DOMSYNCER_PARAMS);

   const [DOMRects, updateDomRects] = useUpdateDomRect();

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

         updateDomRects({
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
         updateDomRects,
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
         DOMRects: DOMRects,
      },
   ];
};
