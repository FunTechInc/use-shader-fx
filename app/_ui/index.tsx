"use client";

import Image from "next/image";
import s from "./index.module.scss";
import { usePathname } from "next/navigation";

const Menu = () => {
   const pages = [
      "/",
      "/cream",
      "/gradation",
      "/obscurus",
      "/useMorphParticles",
      "/useWobble3D",
   ];
   const pathname = usePathname();
   return (
      <nav className={s.nav}>
         <p>samples:</p>
         <select
            value={pathname}
            onChange={(e) => {
               window.location.href = e.target.value;
            }}>
            {pages.map((page) => (
               <option style={{ color: "black" }} key={page} value={page}>
                  {page}
               </option>
            ))}
         </select>
      </nav>
   );
};

export const UI = () => {
   return (
      <div className={s.container}>
         <Menu />
         <ul className={s.snsLink}>
            <li>
               <a
                  href="https://github.com/FunTechInc/use-shader-fx"
                  target={"_blank"}>
                  <Image
                     src="github-logo.svg"
                     alt="GitHub"
                     width={28}
                     height={28}
                  />
               </a>
            </li>
            <li>
               <a href="https://twitter.com/tkm_hmng8" target={"_blank"}>
                  <Image src="x-logo.svg" alt="X" width={24} height={24} />
               </a>
            </li>
         </ul>
      </div>
   );
};
