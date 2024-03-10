import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";

export type ColorStrataParams = {
   /** default: null */
   texture?: THREE.Texture | false;
   /** Valid when texture is false. default : 1 */
   scale?: number;
   /** default: 1.0 */
   laminateLayer?: number;
   /** default: (0.1, 0.1) */
   laminateInterval?: THREE.Vector2;
   /** default: (1.0, 1.0) */
   laminateDetail?: THREE.Vector2;
   /** default: (0.0, 0.0) */
   distortion?: THREE.Vector2;
   /** default: (1.0, 1.0,1.0) */
   colorFactor?: THREE.Vector3;
   /** default: (0.0, 0.0) */
   timeStrength?: THREE.Vector2;
   /** default:false */
   noise?: THREE.Texture | false;
   /** default : (0.0,0.0) */
   noiseStrength?: THREE.Vector2;
   /** you can get into the rhythm ♪ , default:false */
   beat?: number | false;
};

export type ColorStrataObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const COLORSTRATA_PARAMS: ColorStrataParams = Object.freeze({
   texture: false,
   scale: 1.0,
   laminateLayer: 1.0,
   laminateInterval: new THREE.Vector2(0.1, 0.1),
   laminateDetail: new THREE.Vector2(1, 1),
   distortion: new THREE.Vector2(0, 0),
   colorFactor: new THREE.Vector3(1, 1, 1),
   timeStrength: new THREE.Vector2(0, 0),
   noise: false,
   noiseStrength: new THREE.Vector2(0, 0),
   beat: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useColorStrata = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<ColorStrataParams, ColorStrataObject> => {
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

   const [params, setParams] = useParams<ColorStrataParams>(COLORSTRATA_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: ColorStrataParams) => {
         const { gl, clock } = props;
         updateParams && setParams(updateParams);

         if (params.texture) {
            setUniform(material, "uTexture", params.texture);
            setUniform(material, "isTexture", true);
         } else {
            setUniform(material, "isTexture", false);
            setUniform(material, "scale", params.scale!);
         }

         if (params.noise) {
            setUniform(material, "noise", params.noise);
            setUniform(material, "isNoise", true);
            setUniform(material, "noiseStrength", params.noiseStrength!);
         } else {
            setUniform(material, "isNoise", false);
         }

         setUniform(material, "uTime", params.beat || clock.getElapsedTime());

         setUniform(material, "laminateLayer", params.laminateLayer!);
         setUniform(material, "laminateInterval", params.laminateInterval!);
         setUniform(material, "laminateDetail", params.laminateDetail!);
         setUniform(material, "distortion", params.distortion!);
         setUniform(material, "colorFactor", params.colorFactor!);
         setUniform(material, "timeStrength", params.timeStrength!);

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
