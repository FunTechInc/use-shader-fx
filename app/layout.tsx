import "the-new-css-reset/css/reset.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
            className={inter.className}
            style={{ overflow: "hidden", height: "100svh" }}>
            {children}
         </body>
      </html>
   );
}

export { metadata };
