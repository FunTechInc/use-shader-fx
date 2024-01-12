import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type BlendingParams = {
   /** Make this texture Blending , default:THREE.Texture */
   texture?: THREE.Texture;
   /** map texture, default:THREE.Texture */
   map?: THREE.Texture;
   /** map strength , r,g value are affecting , default:0.3 */
   mapIntensity?: number;
   /** Alpha blending is performed using the alpha of the set texture. , default:false */
   alphaMap?: THREE.Texture | false;
   /** default:(0.5,0.5,0.5) */
   brightness?: THREE.Vector3;
   /** default:0.0 */
   min?: number;
   /** default:1.0 */
   max?: number;
   /** If set, this value will apply color dodge , default: false */
   dodgeColor?: THREE.Color | false;
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
   alphaMap: false,
   mapIntensity: 0.3,
   brightness: new THREE.Vector3(0.5, 0.5, 0.5),
   min: 0.0,
   max: 1.0,
   dodgeColor: false,
};

/**
 * Blend map to texture. You can set the threshold for blending with brightness. You can set the dodge color by setting color. 
If you don't want to reflect the map's color, you can use useFxBlending instead.
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useBlending = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<BlendingParams, BlendingObject> => {
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

   const [params, setParams] = useParams<BlendingParams>(BLENDING_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: BlendingParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);
         setUniform(material, "u_texture", params.texture!);
         setUniform(material, "u_map", params.map!);
         setUniform(material, "u_mapIntensity", params.mapIntensity!);

         if (params.alphaMap) {
            setUniform(material, "u_alphaMap", params.alphaMap!);
            setUniform(material, "u_isAlphaMap", true);
         } else {
            setUniform(material, "u_isAlphaMap", false);
         }

         setUniform(material, "u_brightness", params.brightness!);
         setUniform(material, "u_min", params.min!);
         setUniform(material, "u_max", params.max!);
         if (params.dodgeColor) {
            setUniform(material, "u_dodgeColor", params.dodgeColor);
            setUniform(material, "u_isDodgeColor", true);
         } else {
            setUniform(material, "u_isDodgeColor", false);
         }
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
