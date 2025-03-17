import { useCallback, useEffect, useState, RefObject } from "react";
import GUI from "lil-gui";

export const useGUI = (setupGUI: (gui: GUI) => void, title?: string, container?: RefObject<HTMLDivElement>) => {
   const [gui, setGUIState] = useState<GUI | null>(null);

   useEffect(() => {
      if (!gui) {
         const newGui = new GUI({
            closeFolders: true,
            width: 240,
            title,
            autoPlace: container?.current ? false : true,
            container: container?.current || undefined,            
         });
         setGUIState(newGui);
         setupGUI(newGui);
      }
      return () => {
         if (gui) {
            gui?.destroy();
            setGUIState(null);
         }
      };
   }, [gui, setupGUI, title, container]);

   const updateDisplays = useCallback(() => {
      gui?.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, [gui]);
   return updateDisplays;
};
