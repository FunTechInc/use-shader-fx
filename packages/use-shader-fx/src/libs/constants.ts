import * as THREE from "three";

export const ISDEV = process.env.NODE_ENV === "development";

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
