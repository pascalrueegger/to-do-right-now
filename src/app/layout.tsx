import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: "Focus Todo App",
    template: "%s | Focus Todo App"
  },
  description: "A minimalist todo app focusing on the right now. Stay productive by concentrating on your current task.",
  keywords: ["todo", "productivity", "focus", "task management", "minimalist"],
  authors: [{ name: "Focus Todo Team" }],
  creator: "Focus Todo Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://focus-todo.app",
    title: "Focus Todo App",
    description: "A minimalist todo app focusing on the right now",
    siteName: "Focus Todo App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Todo App",
    description: "A minimalist todo app focusing on the right now",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 100%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(222.2 84% 4.9%)' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
