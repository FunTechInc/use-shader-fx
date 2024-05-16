import { memo } from "react";
import Image from "next/image";
import { STICKER_TEXTURES_LENGTH } from "../useStickers";

const GIF_IMAGES = [...Array(STICKER_TEXTURES_LENGTH)].map(
   (_, i) => `/stickers/gif/gif${i}.gif`
);

/** 事前に全てのgif fileのloadを保証する */
export const GifPreloader = memo(() => {
   return (
      <div
         style={{
            visibility: "hidden",
            opacity: 0,
            pointerEvents: "none",
            position: "fixed",
            width: 1,
            height: 1,
         }}>
         {GIF_IMAGES.map((src, i) => (
            <Image
               key={i}
               src={src}
               fill
               alt=""
               priority
               unoptimized
               style={{ visibility: "hidden" }}
            />
         ))}
      </div>
   );
});

GifPreloader.displayName = "GifPreloader";
