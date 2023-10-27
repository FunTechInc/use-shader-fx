import { useCallback, useEffect, useMemo } from "react";
import { CONFIG } from "../config";
import GUI from "lil-gui";

/**
 * @returns updateDisplays コントローラーをupdateDisplayする関数を返します
 */
export const useGUI = () => {
   const gui = useMemo(
      () => new GUI({ closeFolders: true, title: "shader-fx" }),
      []
   );

   useEffect(() => {
      /*===============================================
		post fx
		===============================================*/
      //transitionBg
      const transitionBg = gui.addFolder("transitionBg(post)");
      transitionBg.add(CONFIG.transitionBg, "noiseStrength", 0, 1, 0.01);
      transitionBg.add(CONFIG.transitionBg, "progress", 0, 1, 0.01);
      if (CONFIG.transitionBg.dir) {
         transitionBg.add(CONFIG.transitionBg.dir, "x", 0, 1, 0.01);
         transitionBg.add(CONFIG.transitionBg.dir, "y", 0, 1, 0.01);
      }
      transitionBg.add(CONFIG.transitionBg, "transform");
      transitionBg.add(CONFIG.transitionBg, "active");

      //duo
      const duoTone = gui.addFolder("duoTone(post)");
      duoTone.addColor(CONFIG.duoTone, "color0");
      duoTone.addColor(CONFIG.duoTone, "color1");
      duoTone.add(CONFIG.duoTone, "active");

      //fog projection
      const fogProjection = gui.addFolder("fogProjection(post)");
      fogProjection.add(CONFIG.fogProjection, "timeStrength", -10, 10, 0.01);
      fogProjection.add(
         CONFIG.fogProjection,
         "distortionStrength",
         0,
         10,
         0.01
      );
      fogProjection.add(CONFIG.fogProjection, "fogEdge0", 0, 1, 0.01);
      fogProjection.add(CONFIG.fogProjection, "fogEdge1", 0, 1, 0.01);
      fogProjection.addColor(CONFIG.fogProjection, "fogColor");
      fogProjection.add(CONFIG.fogProjection, "active");

      /*===============================================
		fx
		===============================================*/
      const fruid2 = gui.addFolder("fruid(fx)");
      fruid2.add(CONFIG.fruid, "density_dissipation", 0, 1, 0.01);
      fruid2.add(CONFIG.fruid, "velocity_dissipation", 0, 1, 0.01);
      fruid2.add(CONFIG.fruid, "pressure_dissipation", 0, 1, 0.01);
      fruid2.add(CONFIG.fruid, "velocity_acceleration", 0, 100, 1);
      fruid2.add(CONFIG.fruid, "pressure_iterations", 0, 30, 1);
      fruid2.add(CONFIG.fruid, "curl_strength", 0, 100, 1);
      fruid2.add(CONFIG.fruid, "splat_radius", 0, 0.1, 0.001);

      //effect selector
      gui.add(CONFIG, "selectEffect", { Ripple: 0, fruid: 1 });
   }, [gui]);

   const updateDisplays = useCallback(() => {
      gui.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, [gui]);

   return updateDisplays;
};
