import "the-new-css-reset/css/reset.css";
import type { Metadata } from "next";
import { Oswald } from "next/font/google";

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
      <html lang="en" style={{ overflow: "hidden", backgroundColor: "#000" }}>
         <body className={oswald.className}>{children}</body>
      </html>
   );
}

export { metadata };
