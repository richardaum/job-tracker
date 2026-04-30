import "../env/server";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { APP_DESCRIPTION, APP_TITLE, TITLE_TEMPLATE } from "@/app/metadata";
import { AppProviders } from "@/modules/core/providers/AppProviders";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: { default: APP_TITLE, template: TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
