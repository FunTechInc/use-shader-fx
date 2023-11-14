/**
 * Disables the argType control and sets the Default value. The Default value is set by converting the InitialParams value to a string. For objects, it is a JSON string.
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
