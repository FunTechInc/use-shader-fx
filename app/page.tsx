import { Marbling } from "./Marbling/";

import s from "./page.module.scss";

export default function Home() {
   return (
      <div className={s.canvasWrapper}>
         <Marbling />
      </div>
   );
}
