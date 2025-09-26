import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Solideus AI - Smart Contract Generator',
  description: 'Generate, audit, and deploy Solidity smart contracts with AI assistance',
  keywords: ['blockchain', 'solidity', 'smart contracts', 'AI', 'ethereum'],
  authors: [{ name: 'Solideus Team' }],
  openGraph: {
    title: 'Solideus AI - Smart Contract Generator',
    description: 'Generate, audit, and deploy Solidity smart contracts with AI assistance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solideus AI - Smart Contract Generator',
    description: 'Generate, audit, and deploy Solidity smart contracts with AI assistance',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
