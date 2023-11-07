import { useCallback, useEffect, useMemo } from "react";
import { CONFIG } from "./config";
import GUI from "lil-gui";

export const useGUI = () => {
   const gui = useMemo(
      () => new GUI({ closeFolders: true, title: "shader-fx" }),
      []
   );

   useEffect(() => {
      const noise = gui.addFolder("noise");
      noise.add(CONFIG.noise, "timeStrength", 0, 1, 0.01);
      noise.add(CONFIG.noise, "noiseOctaves", 0, 10, 1);
      noise.add(CONFIG.noise, "fbmOctaves", 0, 10, 1);
   }, [gui]);

   const updateDisplays = useCallback(() => {
      gui.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, [gui]);

   return updateDisplays;
};
