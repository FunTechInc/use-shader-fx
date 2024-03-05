import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMaterial } from "./useMaterial";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { useCreateObject } from "./useCreateObject";

export type Morph3DParams = {
   morphProgress?: number;
};

export type Morph3DObject = {
   scene: THREE.Scene;
   object: THREE.Points | THREE.Mesh;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
   positions: Float32Array[];
};

export const MORPH3D_PARAMS: Morph3DParams = {
   morphProgress: 0,
};

interface UseMorph3DProps extends HooksProps {
   scene?: THREE.Scene;
   geometry?: THREE.BufferGeometry;
   material?: THREE.ShaderMaterial | THREE.RawShaderMaterial;
   /** 何らかの理由で`material`からの`vertexShader`の参照に階層が入っている場合、pathをstringで渡すことでPathを修正することが可能です , default:"vertexShader" */
   shaderPath?: string;
   positions?: Float32Array[];
   Object?: typeof THREE.Mesh | typeof THREE.Points;
}

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useMorph3D = ({
   size,
   dpr,
   samples = 0,
   scene,
   geometry = new THREE.SphereGeometry(1, 32, 32),
   material,
   shaderPath = "vertexShader",
   positions,
   Object = THREE.Points,
}: UseMorph3DProps): HooksReturn<Morph3DParams, Morph3DObject> => {
   // シーン
   const defaultScene = useMemo(() => new THREE.Scene(), []);
   const applyScene = scene || defaultScene;

   // カメラ
   const defaultCamera = useCamera(size, "PerspectiveCamera");

   // マテリアルの作成
   const defaultMaterial = useMaterial({ size, dpr });
   const applyMaterial = material || defaultMaterial;

   // objectへのセット
   const { object, positions: generatedPositions } = useCreateObject({
      scene: applyScene,
      geometry: geometry,
      material: applyMaterial,
      positions: positions,
      shaderPath,
      Object,
   });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene: applyScene,
      camera: defaultCamera,
      size,
      dpr,
      samples,
      depthBuffer: true,
   });

   const [params, setParams] = useParams<Morph3DParams>(MORPH3D_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: Morph3DParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         if (!material) {
            setUniform(
               defaultMaterial,
               "uMorphProgress",
               params.morphProgress!
            );
         }

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, setParams, params, defaultMaterial, material]
   );

   return [
      updateFx,
      setParams,
      {
         scene: applyScene,
         object,
         camera: defaultCamera,
         renderTarget,
         output: renderTarget.texture,
         positions: generatedPositions,
      },
   ];
};
