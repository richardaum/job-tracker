/** Vitest only: substitute for resolving `@/app/icon.svg` (Next bundles the real SVG at build time). */
import type { StaticImageData } from "next/image";

const stub: StaticImageData = {
  blurHeight: 0,
  blurWidth: 0,
  height: 256,
  width: 256,
  src: "/stub-job-tracker-app-icon.svg",
};

export default stub;
