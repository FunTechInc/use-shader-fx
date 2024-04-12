"use client";

import { useState } from "react";
import { ShaderFx } from "../ShaderFx";
import { Playground } from "./Playground";

export default function Page() {
   const [dpr, setDpr] = useState(0.05);
   const [file, setFile] = useState<File | null>(null);

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
               position: "fixed",
               bottom: "16px",
               right: "16px",
               fontSize: "14px",
               zIndex: 1000,
               background: "rgba(255,255,255,0.72)",
               padding: "8px",
            }}>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  pointerEvents: "auto",
                  marginBottom: "8px",
               }}>
               <p>
                  dpr <span style={{ fontSize: "12px" }}>(0.01 ~ 2.0)</span> :
               </p>
               <input
                  style={{
                     padding: "4px",
                     background: "white",
                  }}
                  type="number"
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  value={dpr}
                  onChange={(e) => {
                     setDpr(+e.target.value);
                  }}
               />
            </div>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  pointerEvents: "auto",
               }}>
               <p>file :</p>
               <input
                  type="file"
                  multiple={false}
                  accept=".jpg,.png"
                  onChange={(e) => {
                     if (!e.target.files) {
                        return;
                     }
                     setFile(e.target.files[0]);
                  }}
               />
            </div>
         </div>
         <ShaderFx preserveDrawingBuffer isDprUpdate={false}>
            <Playground dpr={dpr} file={file} />
         </ShaderFx>
      </div>
   );
}
