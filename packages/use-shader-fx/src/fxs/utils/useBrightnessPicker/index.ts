import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";

export type BrightnessPickerParams = {
   /** pick brightness from this texture , default : `THREE.Texture` */
   texture?: THREE.Texture;
   /** default : `(0.5,0.5,0.5)` */
   brightness?: THREE.Vector3;
   /** default : `0.0` */
   min?: number;
   /** default : `1.0` */
   max?: number;
};

export type BrightnessPickerObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const BRIGHTNESSPICKER_PARAMS: BrightnessPickerParams = {
   texture: new THREE.Texture(),
   brightness: new THREE.Vector3(0.5, 0.5, 0.5),
   min: 0.0,
   max: 1.0,
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBrightnessPicker = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   uniforms,
   onBeforeCompile,
}: HooksProps): HooksReturn<
   BrightnessPickerParams,
   BrightnessPickerObject,
   CustomParams
> => {
   const _dpr = getDpr(dpr);
   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, uniforms, onBeforeCompile });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<BrightnessPickerParams>(
      BRIGHTNESSPICKER_PARAMS
   );

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: BrightnessPickerParams,
         customParams?: CustomParams
      ) => {
         const { gl } = props;
         newParams && setParams(newParams);
         updateValue("u_texture", params.texture!);
         updateValue("u_brightness", params.brightness!);
         updateValue("u_min", params.min!);
         updateValue("u_max", params.max!);

         updateCustomValue(customParams);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateValue, setParams, params, updateCustomValue]
   );

   return [
      updateFx,
      setParams,
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
