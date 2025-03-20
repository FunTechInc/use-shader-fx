import "the-new-css-reset/css/reset.css";
import "@/css/reset.css";
import "@/css/global.scss";
import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { UI } from "./_components/UI";
import { userAgent } from "next/server";
import { headers } from "next/headers";
import { StableScroller } from "@funtech-inc/spice";

const oswald = Oswald({
   subsets: ["latin"],
   variable: "--font-oswald",
});

const metadata: Metadata = {
   title: "use-shader-fx | ⚡️ More FXs, Less GLSL",
   description: "⚡️ More FXs, Less GLSL",
};

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const headersList = await headers();
   const { device } = userAgent({ headers: headersList });
   return (
      <html lang="en">
         <body className={oswald.className}>
            <StableScroller active={device.type === "mobile"}>
               <main>{children}</main>
            </StableScroller>
            <UI />
         </body>
      </html>
   );
}

export { metadata };
