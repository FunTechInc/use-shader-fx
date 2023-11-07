declare module "*.vert" {
   const content: string;
   export default content;
}

declare module "*.frag" {
   const content: string;
   export default content;
}

// custom.d.ts
declare module "*.png" {
   const value: any;
   export = value;
}
