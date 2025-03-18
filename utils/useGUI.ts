import { useCallback, useEffect, RefObject, useRef } from "react";
import GUI from "lil-gui";

export const useGUI = (setupGUI: (gui: GUI) => void, title?: string, container?: RefObject<HTMLDivElement>) => {   
   const guiRef = useRef<GUI | null>(null);

   useEffect(() => {      

      if (!guiRef.current) {
         const newGui = new GUI({
            closeFolders: true,
            width: 240,
            title,
            autoPlace: container?.current ? false : true,
            container: container?.current || undefined,
         });
         guiRef.current = newGui;
         setupGUI(newGui);
      }
            
      return () => {
         if (guiRef.current) {
            guiRef.current.destroy();
            guiRef.current = null;
         }
      };

   }, [setupGUI, title, container]);

   const updateDisplays = useCallback(() => {      
      guiRef.current?.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );      
   }, []);
   
   return updateDisplays;
};