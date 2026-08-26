import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#041627',
};

export const metadata: Metadata = {
  title: 'HL Associates CRM | Enterprise Regulatory Compliance Suite',
  description: 'Enterprise Regulatory Compliance & Sales CRM for HL Associates',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full bg-[#fbf9fa] text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
