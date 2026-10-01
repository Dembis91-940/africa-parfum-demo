import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Africa Parfum — Une histoire à part",
  description: "Découvrez une sélection de parfums en 3D, guidé par Hermes. Démonstration Africa Parfum.",
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
