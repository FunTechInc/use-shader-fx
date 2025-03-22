import * as THREE from "three";

// CDNとして使う場合、processがundefinedになるので、その場合はfalseを返す
export const ISDEV = (() => {
   try {
      return process.env.NODE_ENV === "development";
   } catch (error) {
      return false;
   }
})();

export const MATERIAL_BASIC_PARAMS = {
   transparent: false,
   depthTest: false,
   depthWrite: false,
};

export const DEFAULT_TEXTURE = new THREE.DataTexture(
   new Uint8Array([0, 0, 0, 0]),
   1,
   1,
   THREE.RGBAFormat
);

export const APP_NAME = "use-shader-fx";

export const THREE_FLAG_PROPS = [
   "isColor",
   "isMatrix3",
   "isMatrix4",
   "isVector2",
   "isVector3",
   "isVector4",
   "isTexture",
   "isQuaternion",
   "isWebGLRenderTarget",
   "isEuler",
   "isBufferGeometry",
   "isMaterial",
   "isCamera",
   "isLight",
   "isObject3D",
   "isBone",
   "isVideoTexture",
];
