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
      // By design, I don't want to pass null to uniform
      if (material.uniforms[key] && value !== null) {
         material.uniforms[key].value = value;
      }
   };
