import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { DuoToneMaterial, useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type DuoToneParams = {
   /** このtextureをduotoneにします , Default:new THREE.Texture() */
   texture?: THREE.Texture;
   /** 1色目 ,　Default:new THREE.Color(0xffffff) */
   color0?: THREE.Color;
   /** 2色目 , Default: new THREE.Color(0x000000) */
   color1?: THREE.Color;
};

export type DuoToneObject = {
   scene: THREE.Scene;
   material: DuoToneMaterial;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const DUOTONE_PARAMS: DuoToneParams = {
   texture: new THREE.Texture(),
   color0: new THREE.Color(0xffffff),
   color1: new THREE.Color(0x000000),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useDuoTone = ({
   size,
}: {
   size: Size;
}): HooksReturn<DuoToneParams, DuoToneObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
   });

   const [params, setParams] = useParams<DuoToneParams>(DUOTONE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams: DuoToneParams) => {
         const { gl } = props;

         setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uColor0", params.color0!);
         setUniform(material, "uColor1", params.color1!);

         const bufferTexture = updateRenderTarget(gl);

         return bufferTexture;
      },
      [updateRenderTarget, material, setParams, params]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
      },
   ];
};
