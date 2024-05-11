import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { useResolution } from "../../../utils/useResolution";
import { setUniform } from "../../../utils/setUniforms";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   DEFAULT_TEXTURE,
   MATERIAL_BASIC_PARAMS,
} from "../../../libs/constants";
import { BRUSH_PARAMS } from ".";
import { setOnBeforeCompile } from "../../../utils/setOnBeforeCompile";

export class BrushMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uBuffer: { value: THREE.Texture };
      uTexture: { value: THREE.Texture };
      uIsTexture: { value: boolean };
      uMap: { value: THREE.Texture };
      uIsMap: { value: boolean };
      uMapIntensity: { value: number };
      uResolution: { value: THREE.Vector2 };
      uRadius: { value: number };
      uSmudge: { value: number };
      uDissipation: { value: number };
      uMotionBlur: { value: number };
      uMotionSample: { value: number };
      uMouse: { value: number };
      uPrevMouse: { value: number };
      uVelocity: { value: number };
      uColor: { value: THREE.Vector3 | THREE.Color };
      uIsCursor: { value: boolean };
      uPressureStart: { value: number };
      uPressureEnd: { value: number };
   };
}

export const useMesh = ({
   scene,
   size,
   dpr,
   uniforms,
   onBeforeCompile,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
} & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uBuffer: { value: DEFAULT_TEXTURE },
            uResolution: { value: new THREE.Vector2(0, 0) },
            uTexture: { value: DEFAULT_TEXTURE },
            uIsTexture: { value: false },
            uMap: { value: DEFAULT_TEXTURE },
            uIsMap: { value: false },
            uMapIntensity: { value: BRUSH_PARAMS.mapIntensity },
            uRadius: { value: BRUSH_PARAMS.radius },
            uSmudge: { value: BRUSH_PARAMS.smudge },
            uDissipation: { value: BRUSH_PARAMS.dissipation },
            uMotionBlur: { value: BRUSH_PARAMS.motionBlur },
            uMotionSample: { value: BRUSH_PARAMS.motionSample },
            uMouse: { value: new THREE.Vector2(-10, -10) },
            uPrevMouse: { value: new THREE.Vector2(-10, -10) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uColor: { value: BRUSH_PARAMS.color },
            uIsCursor: { value: false },
            uPressureStart: { value: 1.0 },
            uPressureEnd: { value: 1.0 },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
         // Must be transparent
         transparent: true,
      });

      mat.onBeforeCompile = setOnBeforeCompile(onBeforeCompile);

      return mat;
   }, [onBeforeCompile, uniforms]) as BrushMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
