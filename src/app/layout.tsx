import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Providers } from "~/app/_components/providers";

export const metadata: Metadata = {
  title: "UTA Booking",
  description: "Система бронирования кортов",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${GeistSans.variable}`}>
      <body className="bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
