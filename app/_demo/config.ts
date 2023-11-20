import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";

import { TRANSITIONBG_PARAMS } from "@/packages/use-shader-fx/src/hooks/useTransitionBg";
import { FRUID_PARAMS } from "@/packages/use-shader-fx/src/hooks/useFruid";
import { FOGPROJECTION_PARAMS } from "@/packages/use-shader-fx/src/hooks/useFogProjection";

export const CONFIG = {
   transitionBg: {
      ...structuredClone(TRANSITIONBG_PARAMS),
      dir: new THREE.Vector2(0.3, 0.4),
      imageResolution: new THREE.Vector2(1440, 1029),
      active: true,
      transformDir: 1,
      transform: () => {
         CONFIG.transitionBg.transformDir *= -1;
         const tl = gsap.timeline({
            defaults: { duration: 2 },
         });
         tl.to(CONFIG.transitionBg, {
            noiseStrength: 0.2,
            progress: 0.5,
            ease: "power2.in",
         });
         tl.to(CONFIG.transitionBg, {
            noiseStrength: 0.0,
            progress: CONFIG.transitionBg.transformDir > 0 ? 0.0 : 1.0,
            ease: "power2.out",
         });
      },
   },
   fogProjection: {
      ...structuredClone(FOGPROJECTION_PARAMS),
      fogColor: new THREE.Color(0xd5cea3),
      active: true,
   },
   fruid: {
      ...structuredClone(FRUID_PARAMS),
      fruidVec: new THREE.Vector3(),
      fruid_color: (velocity: THREE.Vector2) => {
         const rCol = Math.max(0.0, velocity.x * 100);
         const gCol = Math.max(0.0, velocity.y * 100);
         const bCol = (rCol + gCol) / 2;
         return CONFIG.fruid.fruidVec.set(rCol, gCol, bCol);
      },
   },
};

export const setGUI = (gui: GUI) => {
   const transitionBg = gui.addFolder("transitionBg");
   transitionBg.add(CONFIG.transitionBg, "noiseStrength", 0, 1, 0.01);
   transitionBg.add(CONFIG.transitionBg, "progress", 0, 1, 0.01);
   if (CONFIG.transitionBg.dir) {
      transitionBg.add(CONFIG.transitionBg.dir, "x", 0, 1, 0.01);
      transitionBg.add(CONFIG.transitionBg.dir, "y", 0, 1, 0.01);
   }
   transitionBg.add(CONFIG.transitionBg, "transform");
   transitionBg.add(CONFIG.transitionBg, "active");

   const fogProjection = gui.addFolder("fogProjection");
   fogProjection.add(CONFIG.fogProjection, "distortionStrength", 0, 10, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge0", 0, 1, 0.01);
   fogProjection.add(CONFIG.fogProjection, "fogEdge1", 0, 1, 0.01);
   fogProjection.addColor(CONFIG.fogProjection, "fogColor");
   fogProjection.add(CONFIG.fogProjection, "active");

   const fruid = gui.addFolder("fruid");
   fruid.add(CONFIG.fruid, "density_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "velocity_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "pressure_dissipation", 0, 1, 0.01);
   fruid.add(CONFIG.fruid, "velocity_acceleration", 0, 100, 1);
   fruid.add(CONFIG.fruid, "curl_strength", 0, 100, 1);
   fruid.add(CONFIG.fruid, "splat_radius", 0, 0.1, 0.001);
};
