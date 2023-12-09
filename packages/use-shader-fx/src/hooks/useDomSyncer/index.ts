import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { errorHandling } from "./utils/errorHandling";
import { createMesh } from "./utils/createMesh";
import { intersectionHandler } from "./utils/intersectionHandler";
import { updateRect } from "./utils/updateRect";

export type DomSyncerParams = {
   texture: THREE.Texture[];
   dom: (HTMLElement | Element | null)[];
   resolution?: THREE.Vector2[];
};

export type DomSyncerObject = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const DOMSYNCER_PARAMS: DomSyncerParams = {
   texture: [],
   dom: [],
   resolution: [],
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

   // dependenciesをtriggerして、meshと
   const [refreshTrigger, setRefreshTrigger] = useState(true);
   useEffect(() => {
      setRefreshTrigger(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, dependencies);

   const resolutionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
   const intersectionObserverRef = useRef<IntersectionObserver[]>([]);
   const intersectionDomRef = useRef<(HTMLElement | Element | null)[]>([]);
   const isIntersectingRef = useRef<boolean[]>([]);

   const updateFx = useCallback(
      (props: RootState, updateParams?: DomSyncerParams) => {
         const { gl, size } = props;

         updateParams && setParams(updateParams);

         /*===============================================
			エラーハンドリング
			===============================================*/
         errorHandling(params);

         /*===============================================
         最初の1回だけ、materialを生成して、sceneに渡す
			===============================================*/
         if (refreshTrigger) {
            createMesh({
               params,
               size,
               resolutionRef,
               scene,
            });

            intersectionHandler({
               intersectionObserverRef,
               intersectionDomRef,
               isIntersectingRef,
               params,
            });

            setRefreshTrigger(false);
         }

         /*===============================================
			rectを更新する
			===============================================*/
         updateRect({
            params,
            size,
            resolutionRef,
            scene,
            isIntersectingRef,
         });

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, setParams, refreshTrigger, scene, params]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         camera: camera,
         renderTarget: renderTarget,
      },
   ];
};
