import * as THREE from "three";
import { useResolution } from "./useResolution";
import { useState } from "react";
import { Size } from "../hooks/types";

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
   const { width, height, near, far } = getCameraProps(
      resolution.x,
      resolution.y
   );

   const [camera] = useState(() => {
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
   });

   if (camera instanceof THREE.OrthographicCamera) {
      camera.left = -width;
      camera.right = width;
      camera.top = height;
      camera.bottom = -height;
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
   } else if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
   }

   return camera;
};
