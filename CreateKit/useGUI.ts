import { useCallback, useEffect, useMemo } from "react";
import { CONFIG } from "./config";
import GUI from "lil-gui";

export const useGUI = () => {
   const gui = useMemo(
      () => new GUI({ closeFolders: true, title: "shader-fx" }),
      []
   );

   useEffect(() => {
      const sample = gui.addFolder("sample");
      sample.add(CONFIG.sampleFx, "someValue", 0, 1, 0.01);
   }, [gui]);

   const updateDisplays = useCallback(() => {
      gui.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, [gui]);

   return updateDisplays;
};
