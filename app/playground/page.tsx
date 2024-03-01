import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   return (
      <div style={{ width: "100%", height: "100svh", overflow: "hidden", background: "#000000" }}>
         <ShaderFx>
            <Playground />
         </ShaderFx>
      </div>
   );
}
