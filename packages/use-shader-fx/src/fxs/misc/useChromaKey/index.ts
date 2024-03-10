import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";

export type ChromaKeyParams = {
   /** Process this texture with chroma key , default:THREE.Texture */
   texture?: THREE.Texture;
   /** key color for chromakey processing , default: THREE.Color(0x00ff00) */
   keyColor?: THREE.Color;
   /** If the similarity with the key color exceeds this value, it becomes transparent. , default: 0.2 */
   similarity?: number;
   /** smoothness , default : 0.1 */
   smoothness?: number;
   /** spill , default : 0.2 */
   spill?: number;
   /** tone correction , default : THREE.Vector4(1.0, 1.0, 1.0, 1.0) */
   color?: THREE.Vector4;
   /** contrast , default : 1.0 */
   contrast?: number;
   /** brightness , default : 0.0 */
   brightness?: number;
   /** gamma correction , default : 1.0 */
   gamma?: number;
};

export type ChromaKeyObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const CHROMAKEY_PARAMS: ChromaKeyParams = Object.freeze({
   texture: new THREE.Texture(),
   keyColor: new THREE.Color(0x00ff00),
   similarity: 0.2,
   smoothness: 0.1,
   spill: 0.2,
   color: new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
   contrast: 1.0,
   brightness: 0.0,
   gamma: 1.0,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useChromaKey = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<ChromaKeyParams, ChromaKeyObject> => {
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

   const [params, setParams] = useParams<ChromaKeyParams>(CHROMAKEY_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: ChromaKeyParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);

         setUniform(material, "u_texture", params.texture!);
         setUniform(material, "u_keyColor", params.keyColor!);
         setUniform(material, "u_similarity", params.similarity!);
         setUniform(material, "u_smoothness", params.smoothness!);
         setUniform(material, "u_spill", params.spill!);
         setUniform(material, "u_color", params.color!);
         setUniform(material, "u_contrast", params.contrast!);
         setUniform(material, "u_brightness", params.brightness!);
         setUniform(material, "u_gamma", params.gamma!);

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
