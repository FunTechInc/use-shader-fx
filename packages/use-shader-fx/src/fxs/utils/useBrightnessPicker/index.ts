import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";

export type BrightnessPickerParams = {
   /** pick brightness from this texture , default:THREE.Texture */
   texture?: THREE.Texture;
   /** default:(0.5,0.5,0.5) */
   brightness?: THREE.Vector3;
   /** default:0.0 */
   min?: number;
   /** default:1.0 */
   max?: number;
};

export type BrightnessPickerObject = {
   scene: THREE.Scene;
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
   samples = 0,
}: HooksProps): HooksReturn<BrightnessPickerParams, BrightnessPickerObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
   });

   const [params, setParams] = useParams<BrightnessPickerParams>(
      BRIGHTNESSPICKER_PARAMS
   );

   const updateFx = useCallback(
      (props: RootState, updateParams?: BrightnessPickerParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);
         setUniform(material, "u_texture", params.texture!);
         setUniform(material, "u_brightness", params.brightness!);
         setUniform(material, "u_min", params.min!);
         setUniform(material, "u_max", params.max!);
         return updateRenderTarget(gl);
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
         output: renderTarget.texture,
      },
   ];
};
