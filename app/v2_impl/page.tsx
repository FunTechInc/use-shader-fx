import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";
import Image from "next/image";

export default function Page() {
   return (
      <div
         style={{
            position: "fixed",
            width: "100%",
            height: "100svh",
            pointerEvents: "none",
         }}>
         <div
            style={{
               width: "100px",
               height: "100px",
               backgroundColor: "white",
               position: "fixed",
               inset: 0,
               margin: "auto",
               zIndex: 1000,
               mixBlendMode: "hard-light",
            }}>
            <Image src="/momo.jpg" alt="" fill style={{ objectFit: "cover" }} />
         </div>
         <ShaderFx isDprUpdate={false}>
            <Playground />
         </ShaderFx>
      </div>
   );
}
