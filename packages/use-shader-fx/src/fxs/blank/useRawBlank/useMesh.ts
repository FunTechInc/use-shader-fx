import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import { Size } from "@react-three/fiber";
import { setUniform, useResolution } from "../../..";
import { MATERIAL_BASIC_PARAMS } from "../../../libs/constants";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class RawBlankMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
   };
}
export const useMesh = ({
   scene,
   size,
   dpr,
   onBeforeInit,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
} & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uResolution: { value: new THREE.Vector2() },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]) as RawBlankMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
