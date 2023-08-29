import * as THREE from "three";
import Image from "next/image";
import s from "./index.module.scss";
import { distortionState } from "../../store";
import { useState } from "react";
import { useAppStore } from "@/app/_context/useAppStore";

export const TextureUpdater = ({
   defaultImg,
   type,
}: {
   defaultImg: string;
   type: "noise" | "bg0" | "bg1";
}) => {
   const [imgSrc, setImgSrc] = useState(defaultImg);

   const setDistortionTexture = useAppStore(
      (state) => state.setDistortionTexture
   );

   const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
         const objectURL = URL.createObjectURL(file);
         const loader = new THREE.TextureLoader();

         loader.load(
            objectURL,
            (texture) => {
               setImgSrc(objectURL);
               setDistortionTexture({
                  [type]: texture,
               });
               // distortionState.textures[type] = texture;
            },
            undefined,
            (error) => console.error("Error loading texture:", error)
         );
      }
   };

   const handleImageLoaded = () => {
      if (imgSrc !== defaultImg) {
         URL.revokeObjectURL(imgSrc);
      }
   };

   return (
      <div className={s.wrapper}>
         <input
            onChange={changeHandler}
            className={s.fileInput}
            type="file"
            id={`file_${type}`}
            accept=".png,.jpg,.webp"></input>
         <label className={s.label} htmlFor={`file_${type}`}></label>
         <div className={s.bg}>
            <Image
               onLoad={handleImageLoaded}
               src={imgSrc}
               fill={true}
               alt={""}
               sizes={"120px"}
            />
            <p>{type}</p>
         </div>
      </div>
   );
};
