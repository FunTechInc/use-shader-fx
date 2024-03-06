import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { useCreateMorphParticles } from "./useCreateMorphParticles";
import { MorphParticlesMaterial } from "./utils/useMaterial";

export type MorphParticlesParams = {
   morphProgress?: number;
   blurAlpha?: number;
   blurRadius?: number;
   pointSize?: number;
   /** attributeの`uv`を基準にカラーを抽出するので、attributeにuvがないと意図した挙動にならない */
   picture?: THREE.Texture | false;
   /** The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque). use the green channel when sampling this texture. It also affects the size of the point. Default is false. */
   alphaPicture?: THREE.Texture | false;
   color0?: THREE.Color;
   color1?: THREE.Color;
   color2?: THREE.Color;
   color3?: THREE.Color;
   /** これはpointにマップする,texture */
   map?: THREE.Texture | false;
   /** The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque). use the green channel when sampling this texture. Default is false. */
   alphaMap?: THREE.Texture | false;
   /** you can get into the rhythm ♪ , default:false */
   beat?: number | false;
   /** `wobbleStrengthを0にすると、wobbleがstopします. noiseの計算にも影響します` */
   wobbleStrength?: number;
   wobblePositionFrequency?: number;
   wobbleTimeFrequency?: number;
   warpStrength?: number;
   warpPositionFrequency?: number;
   warpTimeFrequency?: number;
};

export type MorphParticlesObject = {
   scene: THREE.Scene;
   points: THREE.Points;
   material: MorphParticlesMaterial;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
   positions: Float32Array[];
};

export const MORPHPARTICLES_PARAMS: MorphParticlesParams = {
   morphProgress: 0,
   blurAlpha: 0.9,
   blurRadius: 0.05,
   pointSize: 0.05,
   picture: false,
   alphaPicture: false,
   color0: new THREE.Color(0xff0000),
   color1: new THREE.Color(0x00ff00),
   color2: new THREE.Color(0x0000ff),
   color3: new THREE.Color(0xffff00),
   map: false,
   beat: false,
   //wobble
   wobbleStrength: 0.0,
   wobblePositionFrequency: 0.5,
   wobbleTimeFrequency: 0.5,
   warpStrength: 0.5,
   warpPositionFrequency: 0.5,
   warpTimeFrequency: 0.5,
};

interface UseMorphParticlesProps extends HooksProps {
   geometry?: THREE.BufferGeometry;
   positions?: Float32Array[];
}

const DEFAULT_GEOMETRY = new THREE.SphereGeometry(1, 32, 32);

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useMorphParticles = ({
   size,
   dpr,
   samples = 0,
   geometry = DEFAULT_GEOMETRY,
   positions,
}: UseMorphParticlesProps): HooksReturn<
   MorphParticlesParams,
   MorphParticlesObject
> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size, "PerspectiveCamera");

   const [updateUniform, { points, material, positions: generatedPositions }] =
      useCreateMorphParticles({ scene, size, dpr, geometry, positions });

   const [params, setParams] = useParams<MorphParticlesParams>(
      MORPHPARTICLES_PARAMS
   );

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
      depthBuffer: true,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams?: MorphParticlesParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);
         updateUniform(props, params);
         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateUniform, params, setParams]
   );

   return [
      updateFx,
      setParams,
      {
         scene,
         points: points as THREE.Points,
         material,
         camera,
         renderTarget,
         output: renderTarget.texture,
         positions: generatedPositions,
      },
   ];
};
