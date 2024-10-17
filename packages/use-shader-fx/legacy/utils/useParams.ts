import { useCallback, useRef } from "react";

type SetParams<T> = (newParams?: Partial<T>) => void;
type UseParamsReturn<T> = [T, SetParams<T>];

/**
 * @param params Receives an initial value object. With structuredClone, deep copy and set, but if the object contains a function, just set it.
 */
export const useParams = <T extends object>(params: T): UseParamsReturn<T> => {
   const isContainsFunctions = (obj: object): boolean =>
      Object.values(obj).some((value) => typeof value === "function");
   const paramsRef = useRef(
      isContainsFunctions(params) ? params : structuredClone(params)
   );

   const setParams = useCallback<SetParams<T>>((newParams) => {
      if (newParams === undefined) {
         return;
      }
      for (const key in newParams) {
         // hasOwnPropertyで保証するべき
         const paramKey = key as keyof T;
         if (
            paramKey in paramsRef.current &&
            newParams[paramKey] !== undefined &&
            newParams[paramKey] !== null
         ) {
            paramsRef.current[paramKey] = newParams[paramKey]!;
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
