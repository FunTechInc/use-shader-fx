import { APP_NAME, ISDEV } from "../libs/constants";

export const warn = (text: string) => {
   if (ISDEV) {
      console.warn(`${APP_NAME}: ${text}`);
   }
};
