import Image from "next/image";
import { useEffect, useState } from "react";
import s from "./index.module.scss";

export const Confetti = ({ state }: { state: number }) => {
   const [styles, setStyles] = useState<
      { top: string; left: string; scale: string }[]
   >([]);

   useEffect(() => {
      // To avoid hydration errors, must be useEffect
      const newStyles = [...Array(8)].map(() => ({
         top: `${Math.random() * 140 - 20}%`,
         left: `${Math.random() * 140 - 20}%`,
         scale: `${Math.random() + 0.5}`,
      }));
      setStyles(newStyles);
   }, [state]);

   return (
      <>
         {styles.map((style, i) => (
            <div className={s.confetti} key={i} style={style}>
               <Image
                  src="/stickers/gif/gif3.gif"
                  fill
                  alt=""
                  unoptimized
                  style={{ visibility: "hidden" }}
               />
            </div>
         ))}
      </>
   );
};
