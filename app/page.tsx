import { Brushes } from "./Brushes/";

import s from "./page.module.scss";

export default function Home() {
   return (
      <div className={s.canvasWrapper}>
         <Brushes />
      </div>
   );
}
