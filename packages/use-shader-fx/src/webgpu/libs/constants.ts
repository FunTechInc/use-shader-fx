import * as THREE from "three/webgpu";

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
