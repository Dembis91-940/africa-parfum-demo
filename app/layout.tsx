import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Africa Parfum — Une histoire à part",
  description: "Découvrez six parfums de grandes maisons, les photographies de leurs vrais flacons et leurs notes.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
