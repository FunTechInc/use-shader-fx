import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   return (
      <div style={{ width: "100%" }}>
         <div
            style={{
               position: "fixed",
               width: "100%",
               height: "100svh",
               pointerEvents: "none",
            }}>
            <ShaderFx preserveDrawingBuffer>
               <Playground />
            </ShaderFx>
         </div>
      </div>
   );
}
