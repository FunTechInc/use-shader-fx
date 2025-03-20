import { WebGLCanvas } from "../../_components/WebGL/WebGLCanvas";
import { Playground } from "./Playground";
import { WebGLTestingContainer } from "@/app/_components/WebGL/WebGLTestingContainer";

export default function Page() {
   return (
      <WebGLTestingContainer>
         <WebGLCanvas isDprUpdate={false}>
            <Playground />
         </WebGLCanvas>
      </WebGLTestingContainer>
   );
}
