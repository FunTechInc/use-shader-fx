import { Fx } from "./fx/";

import s from "./page.module.scss";

export default function Home() {
   return (
      <div className={s.canvasWrapper}>
         <Fx />
      </div>
   );
}
