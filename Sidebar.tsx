import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YU Travel ERP',
  description: 'Reservation, operation, tours and reporting system for YU Travel',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
