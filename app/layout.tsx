import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-provider';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Personal AI Workspace',
  description: 'A personal Claude-powered workspace for chat, coding, and study.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
