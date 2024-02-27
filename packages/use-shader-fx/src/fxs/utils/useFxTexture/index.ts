import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";

export type FxTextureParams = {
   /** 1st texture , default:THREE.Texture() */
   texture0?: THREE.Texture;
   /** 2nd texture , default:THREE.Texture() */
   texture1?: THREE.Texture;
   /** add transparent padding, 0.0 ~ 1.0 , default:0.0 */
   padding?: number;
   /** The color map. The uv value is affected according to this rbg , default:THREE.Texture() */
   map?: THREE.Texture;
   /** intensity of map , r,g value are affecting , default:0.0 */
   mapIntensity?: number;
   /** Intensity of effect on edges , default:0.0 */
   edgeIntensity?: number;
   /** epicenter of fx, -1 ~ 1 , default:vec2(0.0,0.0)*/
   epicenter?: THREE.Vector2;
   /** Switch value to switch between texture0 and texture1 , 0 ~ 1 , default : 0 */
   progress?: number;
   /** direction of transition , default: THREE.Vector2(0, 0) */
   dir?: THREE.Vector2;
};

export type FxTextureObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const FXTEXTURE_PARAMS: FxTextureParams = {
   texture0: new THREE.Texture(),
   texture1: new THREE.Texture(),
   padding: 0.0,
   map: new THREE.Texture(),
   mapIntensity: 0.0,
   edgeIntensity: 0.0,
   epicenter: new THREE.Vector2(0, 0),
   progress: 0.0,
   dir: new THREE.Vector2(0, 0),
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFxTexture = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<FxTextureParams, FxTextureObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      dpr,
      size,
      samples,
      isSizeUpdate: true,
   });

   const [params, setParams] = useParams<FxTextureParams>(FXTEXTURE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: FxTextureParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture0", params.texture0!);
         setUniform(material, "uTexture1", params.texture1!);

         setUniform(material, "progress", params.progress!);

         // calculate resolution by linear interpolation.
         const tex0Res = [
            params.texture0!?.image?.width || 0,
            params.texture0!?.image?.height || 0,
         ];
         const tex1Res = [
            params.texture1!?.image?.width || 0,
            params.texture1!?.image?.height || 0,
         ];
         const interpolatedResolution = tex0Res.map((value, index) => {
            return value + (tex1Res[index] - value) * params.progress!;
         });
         setUniform(material, "uTextureResolution", interpolatedResolution);

         setUniform(material, "padding", params.padding!);
         setUniform(material, "uMap", params.map!);
         setUniform(material, "mapIntensity", params.mapIntensity!);
         setUniform(material, "edgeIntensity", params.edgeIntensity!);
         setUniform(material, "epicenter", params.epicenter!);
         setUniform(material, "dirX", params.dir!.x);
         setUniform(material, "dirY", params.dir!.y);

         return updateRenderTarget(gl);
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
         output: renderTarget.texture,
      },
   ];
};
