import "the-new-css-reset/css/reset.css";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
   subsets: ["latin"],
   variable: "--font-playfair",
});

const metadata: Metadata = {
   title: "use-shader-fx",
   description: "wide variety of shader effects for React",
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en">
         <body
            className={playfair.className}
            style={{
               overflow: "hidden",
               height: "100svh",
               // background: "#f8f8f8",
            }}>
            {children}
         </body>
      </html>
   );
}

export { metadata };
