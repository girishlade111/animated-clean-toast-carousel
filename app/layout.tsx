import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React

const figtree = Figtree({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Flowers & Saints Toast UI",
  description: "An interactive UI showcasing flowers and saints with toast notifications",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={figtree.className}>{children}</body>
    </html>
  )
}
