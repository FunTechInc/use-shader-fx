import { WebGLCanvas } from "../../_components/WebGL/WebGLCanvas";
import { Playground } from "./Playground";
import { WebGLContainer } from "@/app/_components/WebGL/WebGLContainer";

export default function Page() {
   return (
      <div>
         <div
            style={{
               fontSize: "60rem",
               height: "500svh",
            }}>
            smooth touch interaction on mobile
         </div>
         <WebGLContainer style={{ pointerEvents: "none", zIndex: -100000 }}>
            <WebGLCanvas dpr={1} isDprUpdate={false}>
               <Playground />
            </WebGLCanvas>
         </WebGLContainer>
      </div>
   );
}
