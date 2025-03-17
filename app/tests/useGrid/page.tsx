import { ShaderFx } from "../../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   return (
      <ShaderFx isDprUpdate={false}>
         <Playground />
      </ShaderFx>
   );
}
