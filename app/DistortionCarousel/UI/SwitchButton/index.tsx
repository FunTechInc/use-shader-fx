import { gsap } from "gsap";
import { distortionState } from "../../store";
import s from "./index.module.scss";

export const SwitchButton = ({ index }: { index: number }) => {
   const switchHandler = (index: number) => {
      gsap.to(distortionState, {
         progress: index,
         duration: 1,
         ease: "power3.out",
      });
   };

   return (
      <button
         onClick={() => {
            switchHandler(index);
         }}
         className={s.switch_btn}>
         {index === 0 ? "<" : ">"}
      </button>
   );
};
