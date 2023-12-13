import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type FxTextureParams = {
   /** 1st texture , default:THREE.Texture() */
   texture0?: THREE.Texture;
   /** 2nd texture , default:THREE.Texture() */
   texture1?: THREE.Texture;
   /** background texture resolution , default:THREE.Vector2(0, 0) */
   textureResolution?: THREE.Vector2;
   /** add transparent padding, 0.0 ~ 1.0 , default:0.0 */
   padding?: number;
   /** The color map. The uv value is affected according to this rbg , default:THREE.Texture() */
   map?: THREE.Texture;
   /** intensity of map , default:0.0 */
   mapIntensity?: number;
   /** Intensity of effect on edges , default:0.0 */
   edgeIntensity?: number;
   /** epicenter of fx, -1 ~ 1 , default:vec2(0.0,0.0)*/
   epicenter?: THREE.Vector2;
   /** Switch value to switch between texture0 and texture1 */
   progress?: number;
   /** direction of transition , default: THREE.Vector2(0, 0) */
   dir?: THREE.Vector2;
};

export type FxTextureObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const FXTEXTURE_PARAMS: FxTextureParams = {
   texture0: new THREE.Texture(),
   texture1: new THREE.Texture(),
   textureResolution: new THREE.Vector2(0, 0),
   padding: 0.0,
   map: new THREE.Texture(),
   mapIntensity: 0.0,
   edgeIntensity: 0.0,
   epicenter: new THREE.Vector2(0, 0),
   progress: 0.0,
   dir: new THREE.Vector2(0, 0),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useFxTexture = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<FxTextureParams, FxTextureObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      dpr,
      size,
      isSizeUpdate: true,
   });

   const [params, setParams] = useParams<FxTextureParams>(FXTEXTURE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: FxTextureParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture0", params.texture0!);
         setUniform(material, "uTexture1", params.texture1!);
         setUniform(material, "uTextureResolution", params.textureResolution!);
         setUniform(material, "padding", params.padding!);
         setUniform(material, "uMap", params.map!);
         setUniform(material, "mapIntensity", params.mapIntensity!);
         setUniform(material, "edgeIntensity", params.edgeIntensity!);
         setUniform(material, "epicenter", params.epicenter!);
         setUniform(material, "progress", params.progress!);
         setUniform(material, "dirX", params.dir!.x);
         setUniform(material, "dirY", params.dir!.y);

         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
      },
      [updateRenderTarget, material, params, setParams]
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
