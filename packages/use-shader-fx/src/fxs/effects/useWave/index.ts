import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";

export type WaveParams = {
   /** -1.0 ~ 1.0 , default : `vec2(0.0,0.0)` */
   epicenter?: THREE.Vector2;
   /** 0.0 ~ 1.0 , default : `0.0` */
   progress?: number;
   /** default : `0.0` */
   width?: number;
   /** default : `0.0` */
   strength?: number;
   /** default : `center` */
   mode?: "center" | "horizontal" | "vertical";
};

export type WaveObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const WAVE_PARAMS: WaveParams = Object.freeze({
   epicenter: new THREE.Vector2(0.0, 0.0),
   progress: 0.0,
   width: 0.0,
   strength: 0.0,
   mode: "center",
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useWave = ({
   size,
   dpr,
   renderTargetOptions,
   isSizeUpdate,
   onBeforeInit,
}: HooksProps): HooksReturn<WaveParams, WaveObject, CustomParams> => {
   const _dpr = getDpr(dpr);
   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, onBeforeInit });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      isSizeUpdate,
      ...renderTargetOptions,
   });

   const [params, setParams] = useParams<WaveParams>(WAVE_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateParams = useCallback(
      (newParams?: WaveParams, customParams?: CustomParams) => {
         setParams(newParams);
         updateCustomValue(customParams);
      },
      [setParams, updateCustomValue]
   );

   const updateFx = useCallback(
      (
         rootState: RootState,
         newParams?: WaveParams,
         customParams?: CustomParams
      ) => {
         const { gl } = rootState;

         updateParams(newParams, customParams);

         updateValue("uEpicenter", params.epicenter!);
         updateValue("uProgress", params.progress!);
         updateValue("uWidth", params.width!);
         updateValue("uStrength", params.strength!);
         updateValue(
            "uMode",
            params.mode! === "center"
               ? 0
               : params.mode! === "horizontal"
               ? 1
               : 2
         );

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateValue, params, updateParams]
   );

   return [
      updateFx,
      updateParams,
      {
         scene: scene,
         mesh: mesh,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
