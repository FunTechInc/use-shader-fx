import * as THREE from "three";
import { useCallback, useEffect, useMemo } from "react";
import { useMaterial } from "./useMaterial";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { useInteractiveMesh } from "./useInteractiveMesh";
import vertexShader from "./shader/main.vert";
import { useMorph3D } from "./useMorph3D";

export type ParticlesParams = {
   /** パーティクル全体にマップする */
   // picture?: THREE.Texture | false;
   // pointSize?: number;
   // displacement?: THREE.Texture | THREE.Texture[];
   morphProgress?: number;
};

export type ParticlesObject = {
   scene: THREE.Scene;
   points: THREE.Points;
   // interactiveMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const PARTICLES_PARAMS: ParticlesParams = {
   morphProgress: 0,
};

interface UseParticlesProps extends HooksProps {
   baseGeometry?: THREE.BufferGeometry;
   positions?: Float32Array[];
}

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useParticles = ({
   size,
   dpr,
   samples = 0,
   baseGeometry = new THREE.PlaneGeometry(2, 2, 128, 128),
   positions,
}: UseParticlesProps): HooksReturn<ParticlesParams, ParticlesObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size, "PerspectiveCamera");

   // マテリアルの作成
   const material = useMaterial({ size, dpr });

   // morphとpointsへのセット
   const { object: points, positions: hogehoge } = useMorph3D({
      scene,
      geometry: baseGeometry,
      material,
      positions: positions,
   });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
      depthBuffer: true,
   });

   const [params, setParams] = useParams<ParticlesParams>(PARTICLES_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: ParticlesParams) => {
         const { gl, clock } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTime", clock.getElapsedTime());
         setUniform(material, "uMorphProgress", params.morphProgress!);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, setParams, params, material]
   );

   return [
      updateFx,
      setParams,
      {
         scene,
         points: points as THREE.Points,
         camera,
         renderTarget,
         output: renderTarget.texture,
      },
   ];
};
