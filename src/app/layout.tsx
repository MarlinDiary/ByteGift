import type React from "react"
import type { Metadata } from "next"
import { Inter, Caveat } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Unwrap Love",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${caveat.variable} antialiased`}>{children}</body>
    </html>
  )
}

