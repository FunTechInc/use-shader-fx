type UniformValue = THREE.CubeTexture | THREE.Texture | Int32Array | Float32Array | THREE.Matrix4 | THREE.Matrix3 | THREE.Quaternion | THREE.Vector4 | THREE.Vector3 | THREE.Vector2 | THREE.Color | number | boolean | Array<any> | null;
type UniformObject = {
    [key: string]: {
        value: UniformValue;
    };
};
export declare const setUniform: <T extends UniformObject>(material: {
    uniforms: T;
}, key: keyof T, value: UniformValue) => void;
export {};
