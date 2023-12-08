import { useCallback, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";

export type DomSyncerParams = {
   texture: THREE.Texture[];
   dom: (HTMLElement | Element | null)[];
};

export type DomSyncerObject = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const DOMSYNCER_PARAMS: DomSyncerParams = {
   texture: [],
   dom: [],
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

   const [refreshTrigger, setRefreshTrigger] = useState(true);
   useEffect(() => {
      setRefreshTrigger(true);
      return () => {
         for (let i = 0; i < scene.children.length; i++) {
            const child = scene.children[i];
            if (child instanceof THREE.Mesh) {
               child.geometry.dispose();
               child.material.dispose();
            }
         }
         scene.remove(...scene.children);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, dependencies);

   const [params, setParams] = useParams<DomSyncerParams>(DOMSYNCER_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: DomSyncerParams) => {
         const { gl, size } = props;

         updateParams && setParams(updateParams);

         /*===============================================
			エラー
			===============================================*/
         if (params.dom.length !== params.texture.length) {
            throw new Error("domとテクスチャーの数は一致しません！");
         }
         if (params.dom.length === 0 || params.texture.length === 0) {
            throw new Error("配列が空ですよ！");
         }

         /*===============================================
         // 最初の1回だけ、materialを生成して、sceneに渡す
			===============================================*/
         if (refreshTrigger) {
            for (let i = 0; i < params.dom.length; i++) {
               const object = new THREE.Mesh(
                  new THREE.PlaneGeometry(1, 1),
                  new THREE.ShaderMaterial({
                     vertexShader: vertexShader,
                     fragmentShader: fragmentShader,
                     transparent: true,
                     uniforms: {
                        u_texture: { value: params.texture[i] },
                     },
                  })
               );
               scene.add(object);
            }
            setRefreshTrigger(false);
         }

         /*===============================================
			rectを計算する
			//TODO*　intersection してる時だけ計算するようにしたい
			===============================================*/
         for (let i = 0; i < scene.children.length; i++) {
            const domElement = params.dom[i];
            if (!domElement) {
               throw new Error("domが取得できてないっぽい！");
            }
            const rect = domElement.getBoundingClientRect();
            const object = scene.children[i];
            object.scale.set(rect.width, rect.height, 1.0);
            object.position.set(
               rect.left + rect.width * 0.5 - size.width * 0.5,
               -rect.top - rect.height * 0.5 + size.height * 0.5,
               0.0
            );
         }

         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
      },
      [
         updateRenderTarget,
         setParams,
         refreshTrigger,
         scene,
         params.dom,
         params.texture,
      ]
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
