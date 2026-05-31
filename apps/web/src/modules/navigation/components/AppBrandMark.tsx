import { cn } from "@job-tracker/ui";
import Image from "next/image";

import icon from "@/app/icon.svg";

type AppBrandMarkProps = { size?: number; className?: string };

/** Same raster as favicon toolbar / chrome extension (`src/app/icon.svg`). */
export function AppBrandMark({ size = 22, className }: AppBrandMarkProps) {
  return (
    <Image alt="" aria-hidden className={cn("shrink-0", className)} height={size} src={icon} unoptimized width={size} />
  );
}
