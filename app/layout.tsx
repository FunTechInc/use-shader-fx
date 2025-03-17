import "the-new-css-reset/css/reset.css";
import "./main.css";
import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { UI } from "./_ui";

const oswald = Oswald({
   subsets: ["latin"],
   variable: "--font-oswald",
});

const metadata: Metadata = {
   title: "use-shader-fx | ⚡️ More FXs, Less GLSL",
   description: "⚡️ More FXs, Less GLSL",
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html
         lang="en"
         style={{
            overflow: "hidden",
            backgroundColor: "#000",
            backgroundImage: "url(/bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            touchAction: "none",
            userSelect: "none",
            height: "100svh",
         }}>
         <body className={oswald.className}>
            <div style={{ position: "fixed", width: "100%", height: "100%" }}>
               {children}
            </div>
            <UI />
         </body>
      </html>
   );
}

export { metadata };
