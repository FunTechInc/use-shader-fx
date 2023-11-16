import { useCallback, useRef } from "react";

type UseParamsReturn<T> = [T, (params: Partial<T>) => void];

/**
 * @param params Receives an initial value object. With structuredClone, deep copy and set, but if the object contains a function, just set it.
 */
export const useParams = <T extends object>(params: T): UseParamsReturn<T> => {
   const isContainsFunctions = (obj: object): boolean =>
      Object.values(obj).some((value) => typeof value === "function");
   const paramsRef = useRef(
      isContainsFunctions(params) ? params : structuredClone(params)
   );

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
