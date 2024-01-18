import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type FxBlendingParams = {
   /** Make this texture Blending , default:THREE.Texture */
   texture?: THREE.Texture;
   /** map texture, default:THREE.Texture */
   map?: THREE.Texture;
   /** map strength , r,g value are affecting , default:0.3 */
   mapIntensity?: number;
};

export type FxBlendingObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const FXBLENDING_PARAMS: FxBlendingParams = {
   texture: new THREE.Texture(),
   map: new THREE.Texture(),
   mapIntensity: 0.3,
};

/**
 * Blend map to texture. You can change the intensity of fx applied by the rg value of map. Unlike "useBlending", the map color is not reflected.
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useFxBlending = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<FxBlendingParams, FxBlendingObject> => {
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

   const [params, setParams] = useParams<FxBlendingParams>(FXBLENDING_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: FxBlendingParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);
         setUniform(material, "u_texture", params.texture!);
         setUniform(material, "u_map", params.map!);
         setUniform(material, "u_mapIntensity", params.mapIntensity!);
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
         output: renderTarget.texture,
      },
   ];
};
