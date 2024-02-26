import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseChromaKey } from "./UseChromaKey";
import {
   CHROMAKEY_PARAMS,
   ChromaKeyParams,
} from "../../packages/use-shader-fx/src/fxs/misc/useChromaKey";

const meta = {
   title: "misc/useChromaKey",
   component: UseChromaKey,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseChromaKey>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: CHROMAKEY_PARAMS,
   argTypes: setArgTypes<ChromaKeyParams>(CHROMAKEY_PARAMS),
};
