import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['600','700','800'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['400','500'] })

export const metadata: Metadata = {
  title: 'FleetOps — Bus Fleet Management',
  description: 'Real-time fleet status, maintenance tracking and reporting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
