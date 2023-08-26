import { DistortionCarousel } from "./DistortionCarousel/";

import s from "./page.module.scss";

export default function Home() {
   return (
      <div className={s.canvasWrapper}>
         <DistortionCarousel />
      </div>
   );
}
