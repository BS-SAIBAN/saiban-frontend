import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Saiban BMS — Baitussalam Beneficiary Management',
  description: 'Production-grade NGO beneficiary management system for Baitussalam',
  icons: {
    icon: [
      { url: '/assets/logo.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/logo.png', sizes: 'any', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
