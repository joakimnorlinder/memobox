import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemoBox - Your Beautiful Notes App",
  description: "Create, organize, and manage your notes with images, todos, and folders",
  icons: {
    icon: [
      { url: "/memobox_logo.png" },
      { url: "/memobox_logo.png", sizes: "192x192", type: "image/png" },
      { url: "/memobox_logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/memobox_logo.png",
  },
  openGraph: {
    title: "MemoBox - Your Beautiful Notes App",
    description: "Create, organize, and manage your notes with images, todos, and folders",
    images: ["/memobox_logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MemoBox - Your Beautiful Notes App",
    description: "Create, organize, and manage your notes with images, todos, and folders",
    images: ["/memobox_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
