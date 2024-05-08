import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   return (
      <div
         style={{
            position: "fixed",
            width: "100%",
            height: "100svh",
            pointerEvents: "none",
         }}>
         <ShaderFx isDprUpdate={false}>
            <Playground />
         </ShaderFx>
         <a
            style={{
               position: "fixed",
               bottom: "16px",
               width: "100%",
               textAlign: "center",
               color: "white",
               pointerEvents: "auto",
               fontSize: "14px",
            }}
            href="https://www.instagram.com/sho__asakawa/"
            target={"_blank"}>
            art by{" "}
            <span style={{ textDecoration: "underline" }}>Sho Asakawa</span>
         </a>
      </div>
   );
}
