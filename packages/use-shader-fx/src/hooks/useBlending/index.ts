import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type BlendingParams = {
   /** Make this texture Blending , default:THREE.Texture */
   texture?: THREE.Texture;
   /** map texture, default:THREE.Texture */
   map?: THREE.Texture;
   /** map strength , r,g value are affecting , default:0.3 */
   mapIntensity?: number;
   /** default:(0.5,0.5,0.5) */
   brightness?: THREE.Vector3;
   /** default:0.0 */
   min?: number;
   /** default:1.0 */
   max?: number;
   /** dodge color , default: THREE.Color(0xffffff) */
   color?: THREE.Color;
};

export type BlendingObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const BLENDING_PARAMS: BlendingParams = {
   texture: new THREE.Texture(),
   map: new THREE.Texture(),
   mapIntensity: 0.3,
   brightness: new THREE.Vector3(0.5, 0.5, 0.5),
   min: 0.0,
   max: 1.0,
   color: new THREE.Color(0xffffff),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useBlending = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<BlendingParams, BlendingObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
   });

   const [params, setParams] = useParams<BlendingParams>(BLENDING_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: BlendingParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);
         setUniform(material, "u_texture", params.texture!);
         setUniform(material, "u_map", params.map!);
         setUniform(material, "u_mapIntensity", params.mapIntensity!);
         setUniform(material, "u_brightness", params.brightness!);
         setUniform(material, "u_min", params.min!);
         setUniform(material, "u_max", params.max!);
         setUniform(material, "u_color", params.color!);
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
