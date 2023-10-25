import { CONFIG } from "../config";
import GUI from "lil-gui";

/**
 * @returns updateDisplays コントローラーをupdateDisplayする関数を返します
 */
export const useGUI = () => {
   const gui = new GUI({ closeFolders: true, title: "shader-fx" });

   /*===============================================
	post fx
	===============================================*/
   //bgTexture
   const bgTexture = gui.addFolder("bgTexture(post)");
   bgTexture.add(CONFIG.bgTexture, "noiseStrength", 0, 1, 0.01);
   bgTexture.add(CONFIG.bgTexture, "progress", 0, 1, 0.01);
   if (CONFIG.bgTexture.dir) {
      bgTexture.add(CONFIG.bgTexture.dir, "x", 0, 1, 0.01);
      bgTexture.add(CONFIG.bgTexture.dir, "y", 0, 1, 0.01);
   }
   bgTexture.add(CONFIG.bgTexture, "transform");
   bgTexture.add(CONFIG.bgTexture, "active");

   //duo
   const duoTone = gui.addFolder("duoTone(post)");
   duoTone.addColor(CONFIG.duoTone, "color0");
   duoTone.addColor(CONFIG.duoTone, "color1");
   duoTone.add(CONFIG.duoTone, "active");

   //simpleNoise
   const simpleNoise = gui.addFolder("simpleNoise(post)");
   simpleNoise.add(CONFIG.simpleNoise.xDir, "x", -100, 100, 1);
   simpleNoise.add(CONFIG.simpleNoise.xDir, "y", -100, 100, 1);
   simpleNoise.add(CONFIG.simpleNoise.yDir, "x", -100, 100, 1);
   simpleNoise.add(CONFIG.simpleNoise.yDir, "y", -100, 100, 1);
   simpleNoise.add(CONFIG.simpleNoise, "xTimeStrength", -1, 1, 0.01);
   simpleNoise.add(CONFIG.simpleNoise, "yTimeStrength", -1, 1, 0.01);
   simpleNoise.add(CONFIG.simpleNoise, "xStrength", -1, 1, 0.01);
   simpleNoise.add(CONFIG.simpleNoise, "yStrength", -1, 1, 0.01);
   simpleNoise.add(CONFIG.simpleNoise, "active");

   /*===============================================
	fx
	===============================================*/
   const fruid2 = gui.addFolder("fruid2(fx)");
   fruid2.add(CONFIG.fruid2, "density_dissipation", 0, 1, 0.01);
   fruid2.add(CONFIG.fruid2, "velocity_dissipation", 0, 1, 0.01);
   fruid2.add(CONFIG.fruid2, "pressure_dissipation", 0, 1, 0.01);
   fruid2.add(CONFIG.fruid2, "velocity_acceleration", 0, 100, 1);
   fruid2.add(CONFIG.fruid2, "pressure_iterations", 0, 30, 1);
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
