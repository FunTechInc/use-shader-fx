import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { DuoToneMaterial, useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";

export type DuoToneParams = {
   /** Make this texture duotone , Default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** 1st color ,　Default : `THREE.Color(0xffffff)` */
   color0?: THREE.Color;
   /** 2nd color , Default : `THREE.Color(0x000000)` */
   color1?: THREE.Color;
};

export type DuoToneObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: DuoToneMaterial;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const DUOTONE_PARAMS: DuoToneParams = {
   texture: new THREE.Texture(),
   color0: new THREE.Color(0xffffff),
   color1: new THREE.Color(0x000000),
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useDuoTone = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   onBeforeCompile,
}: HooksProps): HooksReturn<DuoToneParams, DuoToneObject> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, onBeforeCompile });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<DuoToneParams>(DUOTONE_PARAMS);

   const updateValue = setUniform(material);

   const updateFx = useCallback(
      (props: RootState, updateParams?: DuoToneParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         updateValue("uTexture", params.texture!);
         updateValue("uColor0", params.color0!);
         updateValue("uColor1", params.color1!);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateValue, setParams, params]
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
