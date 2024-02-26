import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseFxBlending } from "./UseFxBlending";
import {
   FxBlendingParams,
   FXBLENDING_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/utils/useFxBlending";

const meta = {
   title: "utils/useFxBlending",
   component: UseFxBlending,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseFxBlending>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: FXBLENDING_PARAMS,
   argTypes: setArgTypes<FxBlendingParams>(FXBLENDING_PARAMS),
};
