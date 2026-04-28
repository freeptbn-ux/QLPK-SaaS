import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

import { getAllSettings } from "@/actions/settings";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  const clinicName = settings.clinic_name || 'Phòng khám';
  
  return {
    title: {
      template: `%s | ${clinicName}`,
      default: `Quản Lý ${clinicName} | QLPK`,
    },
    description: 'Phần mềm quản lý phòng khám nhi khoa hiện đại, tối ưu quy trình khám chữa bệnh.',
    icons: { icon: '/icon.png' },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script src="/theme.js" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
