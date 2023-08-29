import { GUIController } from "../gui";
import { distortionState } from "../store";

export const useSetGUI = () => {
   const gui = GUIController.instance;
   gui.addNumericSlider(distortionState, "noiseStrength", 0, 1, 0.01);
   gui.addNumericSlider(distortionState, "progress", 0, 1, 0.01);
   gui.addNumericSlider(distortionState, "progress2", 0, 1, 0.01);
   const contorollers = gui.getContollers();
   const updateDisplays = () => {
      contorollers.forEach((contoroller) => contoroller.updateDisplay());
   };
   return updateDisplays;
};
