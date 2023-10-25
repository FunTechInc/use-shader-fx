export const extractParams = (
   obj: Record<string, any>,
   params: string[]
): Record<string, any> => {
   let extracted: Record<string, any> = {};
   params.forEach((param) => {
      if (obj.hasOwnProperty(param)) {
         extracted[param] = obj[param];
      }
   });
   return extracted;
};
