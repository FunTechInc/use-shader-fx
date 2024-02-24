import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { useSingleFBO } from "../../../utils/useSingleFBO";

export type HSVParams = {
   /**  , default: */
   texture?: THREE.Texture;
   /**  , default: */
   brightness?: number;
   /**  , default: */
   saturation?: number;
};

export type HSVObject = {
   scene: THREE.Scene;
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
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useHSV = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<HSVParams, HSVObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
   });

   const [params, setParams] = useParams<HSVParams>(HSV_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: HSVParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "u_texture", params.texture!);
         setUniform(material, "u_brightness", params.brightness!);
         setUniform(material, "u_saturation", params.saturation!);

         return updateRenderTarget(gl);
      },
      [material, updateRenderTarget, params, setParams]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
