import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConventionConnection - Baseball Card Auto-Crop",
  description:
    "Auto-crop and orient your baseball card images for PSA Set Registry and Fanatics Vault.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ConventionConnection",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0b2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
