import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

/**
 * キャンバスのサイズのstateのフック
 */
export const useResolution = () => {
   const size = useThree((state) => state.size);
   const resolution = useMemo(
      () => new THREE.Vector2(size.width, size.height),
      [size]
   );
   return resolution;
};
