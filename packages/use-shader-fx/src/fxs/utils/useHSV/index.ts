import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { getDpr } from "../../../utils/getDpr";

export type HSVParams = {
   /** default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** default : `1` */
   brightness?: number;
   /** default : `1` */
   saturation?: number;
};

export type HSVObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const HSV_PARAMS: HSVParams = {
   texture: new THREE.Texture(),
   brightness: 1,
   saturation: 1,
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useHSV = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   onBeforeCompile,
}: HooksProps): HooksReturn<HSVParams, HSVObject> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, size, onBeforeCompile });
   const camera = useCamera(size);

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<HSVParams>(HSV_PARAMS);

   const updateValue = setUniform(material);

   const updateFx = useCallback(
      (props: RootState, updateParams?: HSVParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         updateValue("u_texture", params.texture!);
         updateValue("u_brightness", params.brightness!);
         updateValue("u_saturation", params.saturation!);

         return updateRenderTarget(gl);
      },
      [updateValue, updateRenderTarget, params, setParams]
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
