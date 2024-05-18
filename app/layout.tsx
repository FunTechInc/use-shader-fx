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
            touchAction: "none",
         }}>
         <body className={oswald.className}>
            {children}
            <UI />
         </body>
      </html>
   );
}

export { metadata };
