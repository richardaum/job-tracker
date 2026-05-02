declare module "*.svg" {
  import type { StaticImageData } from "next/image";
  const svg: StaticImageData;
  export default svg;
}
