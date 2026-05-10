import { PostHogInitializer } from "@/components/posthog-initializer";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardWise",
  description: "Pick the best card for every purchase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <PostHogInitializer />
        {children}
      </body>
    </html>
  );
}
