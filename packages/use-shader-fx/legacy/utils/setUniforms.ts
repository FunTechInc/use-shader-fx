import * as THREE from "three";
type UniformValue =
   | THREE.CubeTexture
   | THREE.Texture
   | Int32Array
   | Float32Array
   | THREE.Matrix4
   | THREE.Matrix3
   | THREE.Quaternion
   | THREE.Vector4
   | THREE.Vector3
   | THREE.Vector2
   | THREE.Color
   | number
   | boolean
   | Array<any>
   | null
   | undefined;
type UniformObject = { [key: string]: { value: UniformValue } };

export const setUniform =
   <T extends UniformObject>(material: { uniforms: T }) =>
   (key: keyof T, value: UniformValue) => {
      if (value === undefined) {
         return;
      }
      const uniforms = material.uniforms;
      if (uniforms && uniforms[key]) {
         uniforms[key].value = value;
      }
   };

export type CustomParams = { [uniform: string]: UniformValue };
export const setCustomUniform =
   (material: { uniforms: UniformObject }) =>
   (customParams: CustomParams | undefined) => {
      if (customParams === undefined) {
         return;
      }
      Object.keys(customParams).forEach((key) => {
         const uniforms = material.uniforms;
         if (uniforms && uniforms[key]) {
            uniforms[key].value = customParams[key];
         }
      });
   };
