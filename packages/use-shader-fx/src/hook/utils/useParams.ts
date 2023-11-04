import { useCallback, useRef } from "react";

type Return<T> = [T, (params: Partial<T>) => void];

export const useParams = <T extends object>(params: T): Return<T> => {
   const paramsRef = useRef(params);
   const setParams = useCallback((updateParams: Partial<T>) => {
      for (const key in updateParams) {
         const paramKey = key as keyof T;
         if (
            paramKey in paramsRef.current &&
            updateParams[paramKey] !== undefined &&
            updateParams[paramKey] !== null
         ) {
            paramsRef.current[paramKey] = updateParams[paramKey]!;
         } else {
            console.error(
               `"${String(
                  paramKey
               )}" does not exist in the params. or "${String(
                  paramKey
               )}" is null | undefined`
            );
         }
      }
   }, []);
   return [paramsRef.current, setParams];
};
