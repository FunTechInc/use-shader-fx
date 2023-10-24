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
   material.uniforms[key].value = value;
};
