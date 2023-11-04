export const setUniform = (
   material: THREE.ShaderMaterial | THREE.RawShaderMaterial,
   key: string,
   value:
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
) => {
   if (
      material.uniforms &&
      material.uniforms[key] &&
      value !== undefined &&
      value !== null
   ) {
      material.uniforms[key].value = value;
   } else {
      console.error(
         `Uniform key "${key}" does not exist in the material. or "${key}" is null | undefined`
      );
   }
};
