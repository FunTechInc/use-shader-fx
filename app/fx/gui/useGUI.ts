import { CONFIG } from "../config";
import GUI from "lil-gui";

/**
 * @returns updateDisplays コントローラーをupdateDisplayする関数を返します
 */
export const useGUI = () => {
   const gui = new GUI();

   const bgTexture = gui.addFolder("bgTexture");
   bgTexture.add(CONFIG.bgTexture, "noiseStrength", 0, 1, 0.01);
   bgTexture.add(CONFIG.bgTexture, "progress", 0, 1, 0.01);
   if (CONFIG.bgTexture.dir) {
      bgTexture.add(CONFIG.bgTexture.dir, "x", 0, 1, 0.01);
      bgTexture.add(CONFIG.bgTexture.dir, "y", 0, 1, 0.01);
   }
   bgTexture.add(CONFIG, "transform");
   bgTexture.add(CONFIG, "isBg");

   const fruid2 = gui.addFolder("fruid2");
   fruid2.add(CONFIG.fruid2, "density_dissipation", 0, 1, 0.01);
   fruid2.add(CONFIG.fruid2, "velocity_dissipation", 0, 1, 0.01);
   fruid2.add(CONFIG.fruid2, "pressure_dissipation", 0, 1, 0.01);
   fruid2.add(CONFIG.fruid2, "velocity_acceleration", 0, 100, 1);
   fruid2.add(CONFIG.fruid2, "pressure_iterations", 0, 50, 1);
   fruid2.add(CONFIG.fruid2, "curl_strength", 0, 100, 1);
   fruid2.add(CONFIG.fruid2, "splat_radius", 0, 0.1, 0.001);

   //effect selector
   gui.add(CONFIG, "selectEffect", { Ripple: 0, fruid2: 1 });

   const updateDisplays = () => {
      gui.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   };

   return updateDisplays;
};
