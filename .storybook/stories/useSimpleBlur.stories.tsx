import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseSimpleBlur } from "./UseSimpleBlur";
import {
   SIMPLEBLUR_PARAMS,
   SimpleBlurParams,
} from "../../packages/use-shader-fx/src/hooks/useSimpleBlur";

const meta = {
   title: "useSimpleBlur",
   component: UseSimpleBlur,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseSimpleBlur>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: SIMPLEBLUR_PARAMS,
   argTypes: setArgTypes<SimpleBlurParams>(SIMPLEBLUR_PARAMS),
};
