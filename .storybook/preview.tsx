import React from "react";
import type { Preview } from "@storybook/react";
import {
   Title,
   Subtitle,
   Description,
   Primary,
   Controls,
} from "@storybook/blocks";

import "./index.css";

const preview: Preview = {
   parameters: {
      layout: "fullscreen",
      docs: {
         page: () => (
            <>
               <Title />
               <Subtitle />
               <Description />
               <Primary />
               <Controls />
            </>
         ),
      },
   },
   decorators: [
      (Story) => (
         <React.Suspense fallback={null}>
            <Story />
         </React.Suspense>
      ),
   ],
};
export default preview;
