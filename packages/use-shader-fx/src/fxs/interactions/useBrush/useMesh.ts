import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { useResolution } from "../../../utils/useResolution";
import { setUniform } from "../../../utils/setUniforms";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";

export class BrushMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uBuffer: { value: THREE.Texture };
      uTexture: { value: THREE.Texture };
      uIsTexture: { value: boolean };
      uMap: { value: THREE.Texture };
      uIsMap: { value: boolean };
      uMapIntensity: { value: number };
      uResolution: { value: THREE.Texture };
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
            uBuffer: { value: new THREE.Texture() },
            uResolution: { value: new THREE.Vector2(0, 0) },
            uTexture: { value: new THREE.Texture() },
            uIsTexture: { value: false },
            uMap: { value: new THREE.Texture() },
            uIsMap: { value: false },
            uMapIntensity: { value: 0.0 },
            uRadius: { value: 0.0 },
            uSmudge: { value: 0.0 },
            uDissipation: { value: 0.0 },
            uMotionBlur: { value: 0.0 },
            uMotionSample: { value: 0 },
            uMouse: { value: new THREE.Vector2(-10, -10) },
            uPrevMouse: { value: new THREE.Vector2(-10, -10) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uColor: { value: new THREE.Vector3(1, 0, 0) },
            uIsCursor: { value: false },
            uPressureStart: { value: 1.0 },
            uPressureEnd: { value: 1.0 },
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile]) as BrushMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
