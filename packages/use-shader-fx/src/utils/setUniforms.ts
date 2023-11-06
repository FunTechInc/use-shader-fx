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
   | null;
type UniformObject = { [key: string]: { value: UniformValue } };

export const setUniform = <T extends UniformObject>(
   material: { uniforms: T },
   key: keyof T,
   value: UniformValue
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
         `Uniform key "${String(
            key
         )}" does not exist in the material. or "${String(
            key
         )}" is null | undefined`
      );
   }
};
