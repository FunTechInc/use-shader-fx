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
         <ShaderFx isDprUpdate={false}>
            <Playground />
         </ShaderFx>
         <div
            style={{
               color: "white",
               fontSize: ".6vw",
               fontWeight: "bold",
               lineHeight: "1",
               position: "absolute",
               inset: 0,
               width: "100%",
               height: "100%",
               zIndex: 1,
               background: "black",
               overflow: "hidden",
               mixBlendMode: "multiply",
               textAlign: "justify",
               fontFamily: "serif",
            }}>
            <p>
               {/* {[...Array(200)].map(
                  () =>
                     "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti expedita modi mollitia commodi odio adipisci explicabo id, repellendus soluta odit consectetur officia reiciendis ratione neque magni provident dignissimos aliquid hic!"
               )} */}
               {[...Array(600)].map(
                  () =>
                     "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
               )}
               {/* {[...Array(200)].map(
                  () =>
                     "春眠不覚暁処処聞啼鳥夜来風雨声花落知多少春眠不覚暁処処聞啼鳥夜来風雨声花落知多少春眠不覚暁処処聞啼鳥夜来風雨声花落知多少春眠不覚暁処処聞啼鳥夜来風雨声花落知多少春眠不覚暁処処聞啼鳥夜来風雨声花落知多少"
               )} */}
            </p>
         </div>
      </div>
   );
}
