import { SwitchButton } from "./SwitchButton";
import { TextureUpdater } from "./UpdateTexture";
import s from "./index.module.scss";

export const UserInterface = () => {
   return (
      <div className={s.wrapper}>
         <div className={s.switchWrapper}>
            {[0, 1].map((i) => (
               <SwitchButton key={i} index={i} />
            ))}
         </div>
         <div className={s.textureUpdaterWrapper}>
            <TextureUpdater defaultImg="/noiseTexture.jpg" type="noise" />
            <TextureUpdater defaultImg="/sample.jpg" type="bg0" />
            <TextureUpdater defaultImg="/sample2.jpg" type="bg1" />
         </div>
      </div>
   );
};
