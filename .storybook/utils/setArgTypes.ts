/**
 * argTypeのコントロールを無効にし、Default値をセットします。Default値はInitialParamsの値を文字列に変換してセットしています。オブジェクトの場合はJSON文字列にます。
 */
export const setArgTypes = <T extends Record<string, any>>(args: T) => {
   return Object.keys(args).reduce<
      Record<
         keyof T,
         {
            control: { type: null };
            table: { defaultValue: { summary: string } };
         }
      >
   >(
      (acc, key) => {
         const value = args[key];
         const summaryValue =
            typeof value === "object" && value !== null
               ? JSON.stringify(value)
               : String(value);

         acc[key as keyof T] = {
            control: { type: null },
            table: { defaultValue: { summary: summaryValue } },
         };
         return acc;
      },
      {} as Record<
         keyof T,
         {
            control: { type: null };
            table: { defaultValue: { summary: string } };
         }
      >
   );
};
