import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   return (
      <div style={{ width: "100%", height: "100svh", overflow: "hidden" }}>
         <ShaderFx>
            <Playground />
         </ShaderFx>
      </div>
   );
}
