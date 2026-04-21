import "../env/server";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "Job Tracker",
  description: "Track your job applications",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
