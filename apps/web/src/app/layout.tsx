import "@/env/server";
import "./globals.css";

import { cn } from "@ui/lib/cn";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";

import { APP_DESCRIPTION, APP_TITLE, TITLE_TEMPLATE } from "@/app/metadata";
import { AppProviders } from "@/modules/core/providers/AppProviders";

const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--font-outfit" });

export const metadata: Metadata = {
  title: { default: APP_TITLE, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
};

type RootLayoutProps = { children: ReactNode };
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={cn(outfit.variable, "font-sans")}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
