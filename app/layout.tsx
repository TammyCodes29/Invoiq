// ... imports ...
import { Inter } from "next/font/google"
import "./globals.css"
import AppClerkProvider from "@/components/providers/ClerkProvider"

const inter = Inter({ subsets: ["latin"] }) // <- this line must exist

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* THIS IS THE KEY LINE */}
        <AppClerkProvider>
          {children} 
          {/* 'children' here is the content of every single page in your app */}
        </AppClerkProvider>
      </body>
    </html>
  );
}