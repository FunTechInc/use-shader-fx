import { useCallback, useEffect, useRef, RefObject } from "react";
import GUI from "lil-gui";

export const useGUI = (
   setupGUI: (gui: GUI) => void,
   title?: string,
   container?: RefObject<HTMLDivElement>
) => {
   const guiRef = useRef<GUI | null>(null);

   useEffect(() => {
      const containerElement = container?.current;
      if (!guiRef.current) {
         guiRef.current = new GUI({
            closeFolders: true,
            width: 240,
            title,
            autoPlace: !containerElement,
            container: containerElement || undefined,
         });
         setupGUI(guiRef.current);
      }

      return () => {
         guiRef.current?.destroy();
         guiRef.current = null;
      };
   }, [setupGUI, title, container]);

   const updateDisplays = useCallback(() => {
      guiRef.current?.folders.forEach((folder) =>
         folder.controllers.forEach((controller) => controller.updateDisplay())
      );
   }, []);

   return updateDisplays;
};
