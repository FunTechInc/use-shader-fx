import { memo } from "react";
import Image from "next/image";
import { STICKER_TEXTURES_LENGTH } from "../../StickerBall/useStickers";

const GIF_IMAGES = [...Array(STICKER_TEXTURES_LENGTH)].map(
   (_, i) => `/stickers/gif/gif${i}.gif`
);

/** Guarantee all gif file loads in advance */
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
