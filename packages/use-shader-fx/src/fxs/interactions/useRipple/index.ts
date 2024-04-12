import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { usePointer, PointerValues } from "../../../misc/usePointer";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";

export type RippleParams = {
   /** How often ripples appear, default : `0.01` */
   frequency?: number;
   /** rotation rate, default : `0.05` */
   rotation?: number;
   /** fadeout speed, default : `0.9` */
   fadeout_speed?: number;
   /** scale rate, default : `0.3` */
   scale?: number;
   /** alpha, default : `0.6` */
   alpha?: number;
   /** When calling usePointer in a frame loop, setting PointerValues ​​to this value prevents double calls , default : `false` */
   pointerValues?: PointerValues | false;
};

export type RippleObject = {
   scene: THREE.Scene;
   meshArr: THREE.Mesh[];
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const RIPPLE_PARAMS: RippleParams = Object.freeze({
   frequency: 0.01,
   rotation: 0.05,
   fadeout_speed: 0.9,
   scale: 0.3,
   alpha: 0.6,
   pointerValues: false,
});

interface UseRippleProps extends HooksProps {
   /** texture applied to ripple */
   texture?: THREE.Texture;
   /** ripple size, default:64 */
   scale?: number;
   /** ripple max length, default:100 */
   max?: number;
}

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useRipple = ({
   texture = new THREE.Texture(),
   scale = 64,
   max = 100,
   size,
   dpr,
   samples,
   isSizeUpdate,
}: UseRippleProps): HooksReturn<RippleParams, RippleObject> => {
   const _dpr = getDpr(dpr);
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
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<RippleParams>(RIPPLE_PARAMS);

   const currentWave = useRef(0);

   const updateFx = useCallback(
      (props: RootState, updateParams?: RippleParams) => {
         const { gl, pointer, size } = props;

         updateParams && setParams(updateParams);

         const pointerValues = params.pointerValues! || updatePointer(pointer);

         if (params.frequency! < pointerValues.diffPointer.length()) {
            const mesh = meshArr[currentWave.current];
            mesh.visible = true;
            mesh.position.set(
               pointerValues.currentPointer.x * (size.width / 2),
               pointerValues.currentPointer.y * (size.height / 2),
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

         return updateRenderTarget(gl);
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
         output: renderTarget.texture,
      },
   ];
};
