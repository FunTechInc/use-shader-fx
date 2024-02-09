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
            <ShaderFx>
               <Playground />
            </ShaderFx>
         </div>
         <a style={{ fontSize: "100px", fontWeight: "bold" }}>
            これはDOMですこれはDOMですこれはDOMですこれはDOMですこれはDOMです
            これはDOMです これはDOMです これはDOMです これはDOMです
            これはDOMです これはDOMです これはDOMです これはDOMです
            これはDOMです これはDOMです これはDOMです これはDOMです
            これはDOMです これはDOMです これはDOMです これはDOMです
            これはDOMです これはDOMです
         </a>
      </div>
   );
}
