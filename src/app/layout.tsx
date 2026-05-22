import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/context/UserContext'

export const metadata: Metadata = {
  title: 'FleetOps — Bus Fleet Management',
  description: 'Real-time fleet status, maintenance tracking and reporting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
