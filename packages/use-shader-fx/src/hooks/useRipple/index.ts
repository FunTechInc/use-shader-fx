import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { usePointer } from "../../utils/usePointer";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type RippleParams = {
   /** rippleが出現する頻度,default:0.01 */
   frequency?: number;
   /** rippleの回転,default:0.05 */
   rotation?: number;
   /** rippleがフェードアウトするスピード,default:0.9 */
   fadeout_speed?: number;
   /** rippleの拡大率,default:0.3 */
   scale?: number;
   /** rippleの透明度,default:0.6 */
   alpha?: number;
};

export type RippleObject = {
   scene: THREE.Scene;
   meshArr: THREE.Mesh[];
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const RIPPLE_PARAMS: RippleParams = {
   frequency: 0.01,
   rotation: 0.05,
   fadeout_speed: 0.9,
   scale: 0.3,
   alpha: 0.6,
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useRipple = ({
   texture,
   scale = 64,
   max = 100,
   size,
}: {
   /** texture applied to ripple */
   texture: THREE.Texture;
   /** ripple size, default:64 */
   scale?: number;
   /** ripple max length, default:100 */
   max?: number;
   size: Size;
}): HooksReturn<RippleParams, RippleObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const meshArr = useMesh({
      scale: scale,
      max: max,
      texture,
      scene,
   });
   const camera = useCamera(size);
   const updatePointer = usePointer();
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
   });

   const [params, setParams] = useParams<RippleParams>(RIPPLE_PARAMS);

   const currentWave = useRef(0);

   const updateFx = useCallback(
      (props: RootState, updateParams?: RippleParams) => {
         const { gl, pointer, size } = props;

         updateParams && setParams(updateParams);

         const { currentPointer, diffPointer } = updatePointer(pointer);
         if (params.frequency! < diffPointer.length()) {
            const mesh = meshArr[currentWave.current];
            mesh.visible = true;
            mesh.position.set(
               currentPointer.x * (size.width / 2),
               currentPointer.y * (size.height / 2),
               0
            );
            mesh.scale.x = mesh.scale.y = 0.0;
            (mesh.material as THREE.MeshBasicMaterial).opacity = params.alpha!;
            currentWave.current = (currentWave.current + 1) % max;
         }
         meshArr.forEach((mesh) => {
            if (mesh.visible) {
               const material = mesh.material as THREE.MeshBasicMaterial;
               mesh.rotation.z += params.rotation!;
               material.opacity *= params.fadeout_speed!;
               mesh.scale.x =
                  params.fadeout_speed! * mesh.scale.x + params.scale!;
               mesh.scale.y = mesh.scale.x;
               if (material.opacity < 0.002) mesh.visible = false;
            }
         });

         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
      },
      [updateRenderTarget, meshArr, updatePointer, max, params, setParams]
   );
   return [
      updateFx,
      setParams,
      {
         scene: scene,
         camera: camera,
         meshArr: meshArr,
         renderTarget: renderTarget,
      },
   ];
};
