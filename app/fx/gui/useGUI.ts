import { useCallback, useEffect, useMemo } from "react";
import { CONFIG } from "../config";
import GUI from "lil-gui";

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

      const ripple = gui.addFolder("ripple(fx)");
      ripple.add(CONFIG.ripple, "frequency", 0, 1, 0.01);
      ripple.add(CONFIG.ripple, "rotation", 0, 1, 0.01);
      ripple.add(CONFIG.ripple, "fadeout_speed", 0, 1, 0.01);
      ripple.add(CONFIG.ripple, "scale", 0, 1, 0.01);
      ripple.add(CONFIG.ripple, "alpha", 0, 1, 0.01);

      const fruid = gui.addFolder("fruid(fx)");
      fruid.add(CONFIG.fruid, "density_dissipation", 0, 1, 0.01);
      fruid.add(CONFIG.fruid, "velocity_dissipation", 0, 1, 0.01);
      fruid.add(CONFIG.fruid, "pressure_dissipation", 0, 1, 0.01);
      fruid.add(CONFIG.fruid, "velocity_acceleration", 0, 100, 1);
      fruid.add(CONFIG.fruid, "curl_strength", 0, 100, 1);
      fruid.add(CONFIG.fruid, "splat_radius", 0, 0.1, 0.001);

      const brush = gui.addFolder("brush(fx)");
      brush.add(CONFIG.brush, "radius", 0, 0.5, 0.01);
      brush.add(CONFIG.brush, "alpha", 0, 1, 0.01);
      brush.add(CONFIG.brush, "smudge", 0, 1, 0.01);
      brush.add(CONFIG.brush, "dissipation", 0, 1, 0.01);
      brush.add(CONFIG.brush, "magnification", 0, 1, 0.01);
      brush.add(CONFIG.brush, "motionBlur", 0, 1, 0.01);

      const flowmap = gui.addFolder("flowmap(fx)");
      flowmap.add(CONFIG.flowmap, "radius", 0, 1, 0.01);
      flowmap.add(CONFIG.flowmap, "magnification", 0, 1, 0.01);
      flowmap.add(CONFIG.flowmap, "alpha", 0, 1, 0.01);
      flowmap.add(CONFIG.flowmap, "dissipation", 0, 1, 0.01);

      const simpleFruid = gui.addFolder("simpleFruid(fx)");
      simpleFruid.add(CONFIG.simpleFruid, "attenuation", 0, 1, 0.01);
      simpleFruid.add(CONFIG.simpleFruid, "alpha", 0, 1, 0.01);
      simpleFruid.add(CONFIG.simpleFruid, "beta", 0, 1, 0.01);
      simpleFruid.add(CONFIG.simpleFruid, "viscosity", 0, 1, 0.01);
      simpleFruid.add(CONFIG.simpleFruid, "forceRadius", 0, 100, 0.1);
      simpleFruid.add(CONFIG.simpleFruid, "forceCoefficient", 0, 1, 0.1);

      gui.add(CONFIG, "selectEffect", {
         ripple: 0,
         fruid: 1,
         brush: 2,
         flowmap: 3,
         simpleFruid: 4,
      });
   }, [gui]);

   const updateDisplays = useCallback(() => {
      gui.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, [gui]);

   return updateDisplays;
};
