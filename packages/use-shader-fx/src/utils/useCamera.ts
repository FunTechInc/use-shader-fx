import * as THREE from "three";
import { useResolution } from "./useResolution";
import { useMemo } from "react";
import { Size } from "../fxs/types";

const getCameraProps = (width: number, height: number) => {
   const frustumSize = height;
   const aspect = width / height;
   const [w, h] = [(frustumSize * aspect) / 2, frustumSize / 2];
   return { width: w, height: h, near: -1000, far: 1000 };
};

export const useCamera = (
   size: Size,
   cameraType: "OrthographicCamera" | "PerspectiveCamera" = "OrthographicCamera"
) => {
   const resolution = useResolution(size);
   const camera = useMemo(() => {
      const { width, height, near, far } = getCameraProps(
         resolution.x,
         resolution.y
      );
      return cameraType === "OrthographicCamera"
         ? new THREE.OrthographicCamera(
              -width,
              width,
              height,
              -height,
              near,
              far
           )
         : new THREE.PerspectiveCamera(50, width / height);
   }, [resolution, cameraType]);
   return camera;
};
