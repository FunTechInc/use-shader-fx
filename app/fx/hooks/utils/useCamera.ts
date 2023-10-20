import * as THREE from "three";
import { useResolution } from "./useResolution";

const getCameraProps = (width: number, height: number) => {
   const frustumSize = height;
   const aspect = width / height;
   const [w, h] = [(frustumSize * aspect) / 2, frustumSize / 2];
   return { width: w, height: h, near: -1000, far: 1000 };
};

export const useCamera = () => {
   const resolution = useResolution();
   const { width, height, near, far } = getCameraProps(
      resolution.x,
      resolution.y
   );
   const camera = new THREE.OrthographicCamera(
      -width,
      width,
      height,
      -height,
      near,
      far
   );
   return camera;
};
