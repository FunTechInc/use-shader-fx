import * as THREE from "three";
import GUI from "lil-gui";

import { FRUID_PARAMS } from "@/packages/use-shader-fx/src/hooks/useFruid";
import { FOGPROJECTION_PARAMS } from "@/packages/use-shader-fx/src/hooks/useFogProjection";

export const CONFIG = {
   fogProjection: {
      ...structuredClone(FOGPROJECTION_PARAMS),
      fogColor: new THREE.Color(0xffffff),
      fogEdge0: 0.5,
      fogEdge1: 1.0,
      distortionStrength: 0.2,
   },
   fruid: {
      ...structuredClone(FRUID_PARAMS),
      fruidVec: new THREE.Vector3(),
      fruid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.2, velocity.x * 100);
         const gCol = Math.max(0.2, velocity.y * 100);
         const bCol = Math.max(0.4, (rCol + gCol) / 2);
         return CONFIG.fruid.fruidVec.set(rCol, gCol, bCol);
      },
   },
};

export const setGUI = (gui: GUI) => {
   const fogProjection = gui.addFolder("fogProjection");
   fogProjection.add(CONFIG.fogProjection, "distortionStrength", 0, 10, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge0", 0, 1, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge1", 0, 1, 0.01);
   fogProjection.addColor(CONFIG.fogProjection, "fogColor");

   const fruid = gui.addFolder("fruid");
   fruid.add(CONFIG.fruid, "density_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "velocity_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "pressure_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "velocity_acceleration", 0, 100, 1);
   fruid.add(CONFIG.fruid, "curl_strength", 0, 100, 1);
   fruid.add(CONFIG.fruid, "splat_radius", 0, 0.1, 0.001);
};
