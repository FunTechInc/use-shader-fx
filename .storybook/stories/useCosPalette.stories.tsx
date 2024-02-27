import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseCosPalette } from "./UseCosPalette";
import {
   CosPaletteParams,
   COSPALETTE_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/noises/useCosPalette";

const meta = {
   title: "noises/useCosPalette",
   component: UseCosPalette,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseCosPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: COSPALETTE_PARAMS,
   argTypes: setArgTypes<CosPaletteParams>(COSPALETTE_PARAMS),
};

export const Default: Story = {
   render: (args) => <UseCosPalette {...args} />,
   ...storySetting,
};
