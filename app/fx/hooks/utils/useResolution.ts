import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

/**
 * @params isDpr Whether to multiply dpr, default:false
 */
export const useResolution = (isDpr: boolean = false) => {
   const size = useThree((state) => state.size);
   const viewport = useThree((state) => state.viewport);
   const _width = isDpr ? size.width * viewport.dpr : size.width;
   const _height = isDpr ? size.height * viewport.dpr : size.height;
   const resolution = useMemo(
      () => new THREE.Vector2(_width, _height),
      [_width, _height]
   );
   return resolution;
};
