export const setUniform = (
   material: THREE.ShaderMaterial | THREE.RawShaderMaterial,
   key: string,
   value:
      | number
      | THREE.Color
      | THREE.Vector2
      | THREE.Vector3
      | THREE.Vector4
      | THREE.Matrix3
      | THREE.Matrix4
      | THREE.Texture
      | THREE.CubeTexture
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
