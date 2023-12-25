import "the-new-css-reset/css/reset.css";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
   subsets: ["latin"],
   variable: "--font-playfair",
});

const metadata: Metadata = {
   title: "use-shader-fx | The only difficult part is coding the shaders.",
   description: "The only difficult part is coding the shaders.",
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en" style={{ overflow: "hidden" }}>
         <body className={playfair.className}>{children}</body>
      </html>
   );
}

export { metadata };
