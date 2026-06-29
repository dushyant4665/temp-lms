import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/site-header';

const heading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading'
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'Assignment',
  description: 'A simple course platform assessment with auth, dashboard, and lessons.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} font-sans`}>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
