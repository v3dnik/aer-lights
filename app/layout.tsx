import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aer Lights — Premium 3D Designer Lamps Switzerland",
  description:
    "Skulpturale 3D-gedruckte Designer-Leuchten für den Schweizer Luxusmarkt. Handgefertigt in der Schweiz.",
  keywords: "designer lamp, 3D printed lamp, luxury lighting, Switzerland, Zürich",
  openGraph: {
    title: "Aer Lights",
    description: "Die Zukunft des Lichts.",
    url: "https://aer-lights.ch",
    siteName: "Aer Lights",
    locale: "de_CH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: "#080808" }}>{children}</body>
    </html>
  );
}
