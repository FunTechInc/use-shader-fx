import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseBrightnessPicker } from "./UseBrightnessPicker";
import {
   BrightnessPickerParams,
   BRIGHTNESSPICKER_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/utils/useBrightnessPicker";

const meta = {
   title: "utils/useBrightnessPicker",
   component: UseBrightnessPicker,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseBrightnessPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: BRIGHTNESSPICKER_PARAMS,
   argTypes: setArgTypes<BrightnessPickerParams>(BRIGHTNESSPICKER_PARAMS),
};
