import * as THREE from "three";
import GUI from "lil-gui";

import { FLUID_PARAMS } from "@/packages/use-shader-fx/src/hooks/useFluid";
import { BLENDING_PARAMS } from "@/packages/use-shader-fx/src/hooks/useBlending";

export const CONFIG = {
   fogProjection: {
      ...structuredClone(BLENDING_PARAMS),
      fogColor: new THREE.Color(0x000000),
      fogEdge0: 0.0,
      fogEdge1: 0.9,
      distortionStrength: 3.0,
   },
   fluid: {
      ...structuredClone(FLUID_PARAMS),
      fluidVec: new THREE.Vector3(),
      fluid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.2, velocity.x * 100);
         const gCol = Math.max(0.2, velocity.y * 100);
         const bCol = Math.max(0.4, (rCol + gCol) / 2);
         return CONFIG.fluid.fluidVec.set(rCol, gCol, bCol);
      },
   },
};

export const setGUI = (gui: GUI) => {
   const fogProjection = gui.addFolder("fogProjection");
   fogProjection.add(CONFIG.fogProjection, "distortionStrength", 0, 10, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge0", 0, 1, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge1", 0, 1, 0.01);
   fogProjection.addColor(CONFIG.fogProjection, "fogColor");

   const Fluid = gui.addFolder("Fluid");
   Fluid.add(CONFIG.fluid, "density_dissipation", 0, 1, 0.01);
   Fluid.add(CONFIG.fluid, "velocity_dissipation", 0, 1, 0.01);
   Fluid.add(CONFIG.fluid, "pressure_dissipation", 0, 1, 0.01);
   Fluid.add(CONFIG.fluid, "velocity_acceleration", 0, 100, 1);
   Fluid.add(CONFIG.fluid, "curl_strength", 0, 100, 1);
   Fluid.add(CONFIG.fluid, "splat_radius", 0, 0.1, 0.001);
};
