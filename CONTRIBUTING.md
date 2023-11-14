# Contributing

Thank you for considering contributing even a little to this maniacal and self-satisfied library！😊
This repository uses Typescript so please continue to do so.

## How to Contribute

1. Fork and clone the repo
2. Run `yarn install` to install dependencies
3. Create a branch for your PR with `git switch -c /issue-number-your-branch-name`

Please refer to the `README` for instructions on how to create a custom hook!
👉 [README](README.md)! 👈

## Storybook

When creating a new FX, you need to add a Storybook Story.
I am creating a component to make the custom hook's args explicit to storybook.
(This is not the original usage, so the structure is a bit complicated...😭)

-  Each story is stored in .storybook/stories
-  utils contains functions useful for creating stories
